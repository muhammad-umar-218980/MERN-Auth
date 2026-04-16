import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!decodedToken || !decodedToken.id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        if (decodedToken.id) {
            req.body.userID = decodedToken.id;
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export default userAuth;