import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import generateOtp from "../utility/generateOtp.js";
import sendEmail from "../utility/sendEmail.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, profilePic } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({
            success: false,
            message: "Email already exists"
        })

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // // send otp
        // const otp = generateOtp();
        // const otpExpiresAt = Date.now() + (1 * 60 * 60 * 1000)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profilePic
        })



        await newUser.save()

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            // user: newUser
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "User registration failed!",
            error: error.message
        })
    }
};

export const setVarificationOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({
            success: false,
            message: "Email is required"
        })
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        })
        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: "Account already verified"
            })
        }

        const otp = generateOtp();
        const otpExpiresAt = Date.now() + (1 * 60 * 60 * 1000)

        user.varificationOtp = otp
        user.varificationOtpExpiresAt = otpExpiresAt

        await sendEmail({
            email: user.email,
            subject: "Verify your email",
            html: `Your OTP is ${otp} and it will expire in 1 hour`
        })

        await user.save()
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            sendTo: {
                email: user.email,
                varificationOtp: otp
            }
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "send verification otp failed"
        })
    }
};

export const varifyAccount = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({
            success: false,
            message: "Email and otp required"
        })
        const user = await User.findOne({ email }).select("-password");
        // console.log(user);
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        })
        if (user.varificationOtp != otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            })
        }
        if (user.varificationOtpExpiresAt < Date.now()) {
            res.status(400).json({
                success: false,
                message: "Otp has expired"
            })
        }

        user.verified = true;
        user.varificationOtp = undefined;
        user.varificationOtpExpiresAt = undefined;

        await user.save()
        await sendEmail({
            email: user.email,
            subject: "Account varification",
            html: `Your Account is verified successfully. you can start messaging now`
        })
        res.status(200).json({
            success: true,
            message: "Account verified successfully",
            user: user
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Account verification failed"
        })

    }
};

export const setResetPasswordOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({
            success: false,
            message: "Email is required"
        })
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        })


        const otp = generateOtp();
        const otpExpiresAt = Date.now() + (1 * 60 * 60 * 1000)

        user.resetPasswordOtp = otp
        user.resetPasswordOtpExpiresAt = otpExpiresAt

        await sendEmail({
            email: user.email,
            subject: "Reset your password",
            html: `Your Reset OTP is ${otp} and it will expire in 1 hour`
        })

        await user.save()
        res.status(200).json({
            success: true,
            message: "Reset password OTP sent successfully",
            sendTo: {
                email: user.email,
                resetPasswordOtp: otp
            }
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "send reset password otp failed"
        })
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;
        if (!email || !otp) return res.status(400).json({
            success: false,
            message: "Email and otp required"
        })
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        })
        if (user.resetPasswordOtp != otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            })
        }
        if (user.resetPasswordOtpExpiresAt < Date.now()) {
            res.status(400).json({
                success: false,
                message: "Otp has expired"
            })
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirm password must be same"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpiresAt = null;

        await user.save()
        await sendEmail({
            email: user.email,
            subject: "Reset password successfully",
            html: `<h1>Your password has been reset successfully.</h1> `
        })
        res.status(200).json({
            success: true,
            message: "Password Reset successfully"
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Password Reset failed"
        })

    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email })

        if (!user) return res.status(404).json({
            success: false,
            message: "User not found"
        })

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }
        const token = jwt.sign(
            { _id: user._id, name: user.name, email: user.email, profilePic: user.profilePic },
            process.env.JWT_SECRET_KEY
        );

        const userData = await User.findOne({ email }, {
            password: 0,
            varificationOtpExpiresAt: 0,
            varificationOtp: 0,
            resetPasswordOtpExpiresAt: 0,
            resetPasswordOtp: 0
        })

        // .cookie('token', token, { secure: true, http: true })
        res.status(200).json({
            success: true,
            message: "User credential varified.",
            token: token,
            user: userData
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed"
        })
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', { secure: true, http: true }).status(200).json({
            success: true,
            message: "logout successfully."
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "logout failed"
        })
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // Case-insensitive search
                { email: { $regex: query, $options: 'i' } }, // Case-insensitive search
            ]
        }, { name: 1, email: 1, profilePic: 1 }).limit(10)

        res.status(200).json({
            success: true,
            users: users
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Search users failed",
            error: error.message
        })
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            })
        }
        const user = await User.findOne({ _id: id }, {
            name: 1,
            email: 1,
            profilePic: 1,
            verified: 1,
        })
        if (!user) {
            return res.status(404).json({
                success: false, message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User found successfully.",
            user: user
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Get user failed",
            error: error.message
        })
    }
};

export const updateUser = async (req, res) => {
    try {
        const { email, ...data } = req.body
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }
        // console.log(data);

        const updatedUser = await User.findOneAndUpdate({ email }, data, {new: true}).select("email name verified profilePic _id")
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Get user failed",
            error: error.message
        })
    }
};

export const authenticatedUserDetails = async (req, res) => {
    try {
        const user = req.user;
        // console.log(user);

        const userDetails = await User.findOne({_id: user._id}).select("-password -resetPasswordOtp -resetPasswordOtpExpiresAt -varificationOtp -varificationOtpExpiresAt")
        res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user: userDetails
        })
    } catch (error) {
        console.error(error);
        
    }
};