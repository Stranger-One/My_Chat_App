import jwt from 'jsonwebtoken'

export const checkAuthentication = async (req, res, next) => {
    try {
        // req.headers['authorization']?.replace('Bearer ', '') ||
        const token = req.query.token;

        // console.log("headers", req.headers);
        // console.log("token", token);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
                user: null
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                user: null
            });
        }
        // console.log("decoded", decoded);
        req.user = decoded;
        next()

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "failed to check user is authenticated or not!"
        })
    }
};