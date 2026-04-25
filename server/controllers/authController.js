
import jwt from "jsonwebtoken";
import { findAdminByEmail } from "../models/auth.js";
import bcrypt from "bcrypt";
import { createAdmin } from "../models/auth.js";
export async function login(req, res) {

    try {

        console.log("LOGIN HIT");

        const { email, password } = req.body;

        console.log("EMAIL:", email);

        const admin =
            await findAdminByEmail(email);

        console.log("ADMIN:", admin);

        if (!admin) {

            return res.status(401).json({
                message: "Admin not found"
            });

        }

        const isMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        console.log("MATCH:", isMatch);

        if (!isMatch) {

            return res.status(401).json({
                message: "Wrong password"
            });

        }

        const token =
            jwt.sign(
                {
                    id: admin.id,
                    email: admin.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            );

        res.json({ token });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

}



export async function register(req, res) {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                message: "Email and password required"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const admin =
            await createAdmin(
                email,
                hashedPassword
            );

        res.status(201).json({
            message: "Admin created",
            admin
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

}