import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    resetPasswordOtp: {
        type: String,
        default: null
    },
    resetPasswordOtpExpiresAt: {
        type: Date,
        default: null
    },
    profilePic: {
        type: String,
        default: "https://www.pngkey.com/png/full/73-730477_first-name-profile-image-placeholder-png.png"
    },
    varificationOtp: {
        type: String,
        default: null
    },
    varificationOtpExpiresAt: {
        type: Date,
        default: null,
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


const User = mongoose.model("User", userSchema);
export default User;