const User = require("../models/User");
const generateToken = require("../utils/generateTokens");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const sendTokenResponse = (user, statusCode, res, message, rememberMe) => {
    const token = generateToken(user._id);

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge,
        path: "/",
    });
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};
const Signup = async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide name,email and password",
        });
    }
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }


    try {
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
        });
        sendTokenResponse(user, 201, res, "User registered successfully", req.body.rememberMe);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }

}

const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const normalizedEmail = (email || "").trim().toLowerCase();
        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        sendTokenResponse(user, 200, res, "User logged in successfully", req.body.rememberMe);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
}

const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

const logout = (req, res) => {
    console.log("Logout request received");
    res.cookie("token", "none", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(Date.now() + 1000), // expires in 1 second
        path: "/",
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body; // the ID token from frontend

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
            });
        } else if (!user.googleId) {
            // existing email/password user signing in with Google for the first time
            user.googleId = googleId;
            await user.save();
        }

        sendTokenResponse(user, 200, res, "Logged in with Google", false);
    } catch (error) {
        console.error("Google login error:", error);
        res.status(401).json({
            success: false,
            message: "Google authentication failed",
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always respond with success even if user not found, to avoid leaking which emails are registered
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If that email exists, a reset link has been sent",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "GigCraft AI — Password Reset",
                html: `
                    <p>You requested a password reset.</p>
                    <p>Click the link below to set a new password. This link expires in 30 minutes.</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                `,
            });

            res.status(200).json({
                success: true,
                message: "Reset link sent to your email",
            });
        } catch (emailError) {
            console.error("Email send failed:", emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: "Could not send reset email, please try again",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select("+resetPasswordToken +resetPasswordExpire");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link",
            });
        }

        user.password = password; // pre("save") hook will hash it
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        sendTokenResponse(user, 200, res, "Password reset successful", false);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    Signup,
    login,
    getMe,
    logout,
    googleLogin,
    forgotPassword,
    resetPassword,
};
