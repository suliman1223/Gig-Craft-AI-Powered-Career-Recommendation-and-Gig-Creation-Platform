const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide a name"],
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Please provide an email"],
        unique:true,
        lowercase:true,
        regex:/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    password:{
        type:String,
        required:[true,"Please provide a password"],
        minlength:6,
        select:false,
    },

    skills: {
      type: [String],
      default: [],
    },
     resumePath: {
      type: String,
      default: "",
    },

},{
    timestamps:true,
});
UserSchema.pre("save",async function(){
   if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
});
UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};


const User=mongoose.model("User",UserSchema);

module.exports=User;