

import {markRefreshTokenAsUsed} from "../models/refreshTokenModel.js";
import {deleteAdminRefreshTokens} from "../models/refreshTokenModel.js";
import { loginSchema } from "../validators/authValidation.js";
import jwt from "jsonwebtoken";
import { findAdminByEmail, findAdminById ,findAdminByIdWithPassword,updateAdminProfileModle } from "../models/auth.js";
import {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken  // ✅ أضفها هون
} from "../models/refreshTokenModel.js";
import { blacklistToken } from "../models/tokenBlacklist.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/db.js";

const ACCESS_TOKEN_SECONDS = 15 * 60;
const SESSION_SECONDS = 72 * 60 * 60;

export async function login(req, res) {

    try {

    const validation =
    loginSchema.safeParse(req.body);

if (!validation.success) {

    return res.status(400).json({
        message: "Invalid input"
    });

}

const { email, password } =
    validation.data;




        

        const admin =
            await findAdminByEmail(email);

     

       
if (!admin) {
  return res.status(401).json({
    message: "Invalid credentials"
  });
}
        const isMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

     

      
        if (!isMatch) {
  return res.status(401).json({
    message: "Invalid credentials"
  });
}

     
const issuedAt = Math.floor(Date.now() / 1000);
const sessionExpiresAt = issuedAt + SESSION_SECONDS;
const accessToken =
    jwt.sign(

        {
            id: admin.id,
            email: admin.email,
            iat: issuedAt
        },

        process.env.JWT_SECRET,

        {
            expiresIn: ACCESS_TOKEN_SECONDS,
            jwtid: crypto.randomUUID()
        }

    );

const refreshToken =
    jwt.sign(

        {
            id: admin.id,
            session_expires_at: sessionExpiresAt,
            iat: issuedAt
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: SESSION_SECONDS,
            jwtid: crypto.randomUUID()
        }

    );


const client = await db.connect();
try {
  await client.query("BEGIN");
  await deleteAdminRefreshTokens(admin.id, client);
  await saveRefreshToken(
    refreshToken, admin.id, new Date(sessionExpiresAt * 1000),
    req.headers["user-agent"], client
  );
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
      
res.cookie(

    "accessToken",

    accessToken,

    {

        httpOnly: true,

        // secure:
        //     process.env.NODE_ENV === "production",

        // sameSite:
        //     process.env.NODE_ENV === "production"
        //         ? "none"
        //         : "lax",
sameSite: "none",
secure: true,
        maxAge:
            15 * 60 * 1000,


            path: "/",
priority: "high"
    }

    
);

res.cookie(

    "refreshToken",

    refreshToken,

    {

        httpOnly: true,

        // secure:
        //     process.env.NODE_ENV === "production",

        // sameSite:
        //     process.env.NODE_ENV === "production"
        //         ? "none"
        //         : "lax",
sameSite: "none",
secure: true,
        maxAge:
            SESSION_SECONDS * 1000,
            path: "/",
priority: "high"

    }

);


   res.json({ message: "Logged in" });

    } catch (error) {

        console.error("Admin login failed");

        res.status(500).json({
            message: "Server error"
        });

    }

}


export async function me(req, res) {
    const admin = await findAdminById(req.admin.id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

   return res.json({
  admin: {
    id: admin.id,
    name: admin.name,
    email: admin.email
  }
});
}


export async function logout(req, res) {

  try {

    const accessToken = req.cookies.accessToken;

    // The existing policy allows one login per Admin. Revoke its rotated
    // tokens too, under the same lock used by refresh and password changes.
    await deleteAdminRefreshTokens(req.admin.id);

    // حرق access token
    if (accessToken) {

      await blacklistToken(

        accessToken,

        new Date(
          Date.now() + 15 * 60 * 1000
        )

      );

    }

    // حذف cookies
   res.clearCookie("accessToken", {

  httpOnly: true,

  // secure:
  //   process.env.NODE_ENV === "production",

  // sameSite:
  //   process.env.NODE_ENV === "production"
  //     ? "none"
  //     : "lax",
sameSite: "none",
secure: true,


  path: "/"

});

    res.clearCookie("refreshToken", {

      httpOnly: true,

      // secure:
      //   process.env.NODE_ENV === "production",

      // sameSite:
      //   process.env.NODE_ENV === "production"
      //     ? "none"
      //     : "lax"
sameSite: "none",
secure: true,
    });

    return res.json({
      message: "Logged out successfully"
    });

  } catch (err) {

    console.error("Admin logout failed");

    return res.status(500).json({
      message: "Logout failed"
    });

  }

}
export async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  let client;
  try {
    client = await db.connect();
    await client.query("BEGIN");
    // Lock the token until rotation commits, so it cannot be consumed twice.
    const savedToken = await findRefreshToken(refreshToken, client);
    const reject = async (message) => {
      await client.query("COMMIT");
      return res.status(401).json({ message });
    };

    if (!savedToken) return await reject("Invalid refresh token");
    if (savedToken.used) {
      await deleteAdminRefreshTokens(savedToken.admin_id, client);
      return await reject("Refresh token reuse detected - session revoked");
    }
    if (new Date(savedToken.expires_at).getTime() <= Date.now()) {
      await deleteRefreshToken(refreshToken, client);
      return await reject("Refresh token expired");
    }
    if (savedToken.user_agent !== req.headers["user-agent"]) {
      await deleteRefreshToken(refreshToken, client);
      return await reject("Suspicious device change detected");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      await deleteRefreshToken(refreshToken, client);
      return await reject("Invalid refresh token");
    }
    if (String(decoded.id) !== String(savedToken.admin_id) || !await findAdminById(decoded.id, client)) {
      await deleteRefreshToken(refreshToken, client);
      return await reject("Invalid refresh session");
    }

    const now = Math.floor(Date.now() / 1000);
    // Legacy tokens are bounded from their issue time on their next rotation.
    const sessionExpiresAt = Math.min(
      Math.floor(new Date(savedToken.expires_at).getTime() / 1000),
      decoded.exp,
      decoded.session_expires_at ?? (decoded.iat + SESSION_SECONDS)
    );
    const remainingSeconds = sessionExpiresAt - now;
    if (!Number.isFinite(remainingSeconds) || remainingSeconds <= 0) {
      await deleteRefreshToken(refreshToken, client);
      return await reject("Refresh session expired");
    }
    const accessSeconds = Math.min(ACCESS_TOKEN_SECONDS, remainingSeconds);
    const newAccessToken = jwt.sign(
      { id: decoded.id, iat: now }, process.env.JWT_SECRET,
      { expiresIn: accessSeconds, jwtid: crypto.randomUUID() }
    );
    const newRefreshToken = jwt.sign(
      { id: decoded.id, session_expires_at: sessionExpiresAt, iat: now },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: remainingSeconds, jwtid: crypto.randomUUID() }
    );

    await markRefreshTokenAsUsed(refreshToken, client);
    await saveRefreshToken(
      newRefreshToken, decoded.id, new Date(sessionExpiresAt * 1000),
      req.headers["user-agent"], client
    );
    await client.query("COMMIT");

    const cookieOptions = { httpOnly: true, secure: true, sameSite: "none", path: "/", priority: "high" };
    res.cookie("accessToken", newAccessToken, { ...cookieOptions, maxAge: accessSeconds * 1000 });
    res.cookie("refreshToken", newRefreshToken, { ...cookieOptions, maxAge: remainingSeconds * 1000 });
    return res.json({ message: "Token refreshed" });
  } catch {
    if (client) await client.query("ROLLBACK").catch(() => {});
    // An unavailable database is recoverable; do not report a revoked session.
    return res.status(503).json({ message: "Session renewal temporarily unavailable" });
  } finally {
    client?.release();
  }
}

export async function updateProfile(req, res) {
  try {
    const adminId = req.admin.id;

    const { name, email, newPassword } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "name and email are required"
      });
    }

    const admin = await findAdminByIdWithPassword(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    let hashedPassword = admin.password;

    if (newPassword && newPassword.trim()) {
      hashedPassword = await bcrypt.hash(newPassword, 12);
    }

const existingAdmin =
  await findAdminByEmail(email);

if (
  existingAdmin &&
  Number(existingAdmin.id) !== Number(adminId)
) {
  return res.status(409).json({
    message: "Email already in use"
  });
}

    const updated = await updateAdminProfileModle(
      adminId,
      name,
      email,
      hashedPassword
    );

    if (newPassword) {
      await deleteAdminRefreshTokens(adminId);
    }

    return res.json({
      message: "Profile updated successfully",
      admin: updated
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to update profile"
    });
  }
}







export async function verifyPassword(req, res) {
  try {
    const adminId = req.admin.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }

  const admin = await findAdminByIdWithPassword(adminId);

    if (!admin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password"
      });
    }

    return res.json({
      message: "Password verified"
    });

  } catch (error) {
    console.error("VERIFY PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
}





