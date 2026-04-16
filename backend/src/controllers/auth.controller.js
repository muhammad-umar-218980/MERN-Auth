import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

export async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });


        const mailOptions = {
            from: process.env.APP_EMAIL,
            to: newUser.email,
            subject: "Welcome to MERN-Auth App !",
            text: `Hi ${newUser.name},\n\nThank you for registering at MERN-Auth App. We're excited to have you on board!\n\nBest regards,\nMERN-Auth Team`,
            html: `<p>Hi ${newUser.name},</p><p>Thank you for registering at MERN-Auth App. We're excited to have you on board!</p><p>Best regards,<br/>MERN-Auth Team</p>`
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.log("Email failed but user was created:", emailError.message);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


export async function login(req, res) {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

}


export async function logout(req, res) {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
        });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export async function sendVerifyOTP(req, res) {
    try{
        const {userID} = req.body;

        const user = await User.findById(userID);

        if(user.isAccountVerified){
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        const OTP = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifyOtp = OTP;
        user.verifyOtpExpireAt = Date.now() + 24*60*60*1000;

        await user.save();

        const mailOptions = {
            from: process.env.APP_EMAIL,
            to: user.email,
            subject: "Your Account Verification OTP",
            text: `Hi ${user.name},\n\nYour OTP for account verification is: ${OTP}\nThis OTP is valid for 24 hours.\n\nBest regards,\nMERN-Auth Team`,
            html: `<p>Hi ${user.name},</p><p>Your OTP for account verification is: <b>${OTP}</b></p><p>This OTP is valid for 24 hours.</p><p>Best regards,<br/>MERN-Auth Team</p>`
        }

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export async function verifyEmail (req,res){
    const {userID, OTP} = req.body;
    const normalizedOtp = String(OTP ?? "").trim();

    if(!userID || !normalizedOtp){
        return res.status(400).json({
            success: false,
            message: "UserID and OTP are required"
        });
    }

    try {
        const user = await User.findById(userID);

        if(!user){
            return res.status(400).json({
                success: false,
                message: "Invalid UserID"
            });
        }

        if(user.isAccountVerified){
            return res.status(400).json({
                success: false,
                message: "Account is already verified"
            });
        }

        if(user.verifyOtp !== normalizedOtp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if(Date.now() > user.verifyOtpExpireAt){
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

export async function isAuthenticated(req, res) {

    try{
        const userID = req.user?.id || req.body?.userID;
        const user = await User.findById(userID);

        return res.status(200).json({
            success: true,
            message: "User is authenticated",
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export async function sendResetPasswordOTP(req, res) {
    const { email } = req.body;

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        try {
            
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User with this email does not exist"
                });
            }

            const OTP = Math.floor(100000 + Math.random() * 900000).toString();

            user.resetOtp = OTP;
            user.resetOtpExpireAt = Date.now() + 10*60*1000;

            await user.save();

            const mailOptions = {
                from: process.env.APP_EMAIL,
                to: user.email, 
                subject: "Your Password Reset OTP",
                text: `Hi ${user.name},\n\nYour OTP for password reset is: ${OTP}\nThis OTP is valid for 10 minutes.\n\nBest regards,\nMERN-Auth Team`,
                html: `<p>Hi ${user.name},</p><p>Your OTP for password reset is: <b>${OTP}</b></p><p>This OTP is valid for 10 minutes.</p><p>Best regards,<br/>MERN-Auth Team</p>`
            }

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                success: true,
                message: "Password reset OTP sent successfully"
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
}

export async function ResetPassword(req, res) {

    const { email, OTP , newPassword } = req.body;
    const normalizedOtp = String(OTP ?? "").trim();

    if(!email?.trim() || !normalizedOtp || !newPassword?.trim()){
        return res.status(400).json({
            success: false,
            message: "Email, OTP and new password are required"
        });
    }


    try {
        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User with this email does not exist"
            });
        }

        if(user.resetOtp !== normalizedOtp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if(Date.now() > user.resetOtpExpireAt){
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}