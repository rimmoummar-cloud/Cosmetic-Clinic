import jwt from "jsonwebtoken";

import { isTokenBlacklisted } from "../models/tokenBlacklist.js";




export async function authenticateAdmin(
    req,
    res,
    next
) {

    try {

        // const token = req.cookies.token;
const token =
    req.cookies.accessToken;
        if (!token) {

            return res.status(401).json({
                message: "No token"
            });

        }

        // ✅ تحقق إذا التوكن محروق
        const blacklisted =
            await isTokenBlacklisted(token);

        if (blacklisted) {

            return res.status(401).json({
                message: "Token revoked"
            });

        }

        // ✅ تحقق JWT
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.admin = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }

}

// export function authenticateAdmin(req, res, next) {
//     try {
//         const token = req.cookies.token;

//         if (!token) {
//             return res.status(401).json({ message: "No token" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         req.admin = decoded;

//         next();
//     } catch {
//         return res.status(401).json({ message: "Invalid token" });
//     }
// }