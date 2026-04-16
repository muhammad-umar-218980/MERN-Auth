import User from "../models/user.model.js";

async function getUserData(req, res) {

    try {
        const { userID } = req.body;

        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                email: user.email,
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export default getUserData;