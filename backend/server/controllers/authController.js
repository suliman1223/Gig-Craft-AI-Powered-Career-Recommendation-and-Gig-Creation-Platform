const User = require("../models/User");
const generateToken = require("../utils/generateTokens");

const sendTokenResponse = (user, statusCode, res,message) => {
    const token = generateToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
        console.log("Signup request body:", req.body);
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name,email and password",
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }


        try {
            const user = await User.create({
                name,
                email,
                password,
            });
            sendTokenResponse(user, 201, res, "User registered successfully");
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
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide email and password",
                });
            }

            const user = await User.findOne({ email }).select("+password");
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

            sendTokenResponse(user, 200, res, "User logged in successfully");
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Server Error",
            });
        }
    }



module.exports = {
    Signup,
    login,
};
