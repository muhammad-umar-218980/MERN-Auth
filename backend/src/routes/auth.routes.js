import express from "express";
import { register, login, logout, sendVerifyOTP, verifyEmail, isAuthenticated , sendResetPasswordOTP ,ResetPassword } from "../controllers/auth.controller.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendVerifyOTP);
authRouter.post("/verify-email", userAuth, verifyEmail);
authRouter.post("/is-authenticated", userAuth, isAuthenticated);
authRouter.post("/send-reset-password-otp", sendResetPasswordOTP);
authRouter.post("/reset-password", ResetPassword);

export default authRouter;