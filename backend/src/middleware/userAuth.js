import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        console.error("No token provided in cookies");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        if (decodedToken.id) {
            req.body = req.body || {};
            req.body.userID = decodedToken.id;
            req.user = { id: decodedToken.id };
        }

        next();
    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token"
        })
    }
}

export default userAuth;