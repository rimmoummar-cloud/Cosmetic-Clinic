

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

     
const accessToken =
    jwt.sign(

        {
            id: admin.id,
            email: admin.email
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "15m"
        }

    );

const refreshToken =
    jwt.sign(

        {
            id: admin.id
        },

        process.env.REFRESH_TOKEN_SECRET,

        {
            expiresIn: "7d"
        }

    );


    await deleteAdminRefreshTokens(admin.id);

await saveRefreshToken(
  refreshToken,
  admin.id,
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  req.headers["user-agent"]
);
      
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
            7 * 24 * 60 * 60 * 1000,
            path: "/",
priority: "high"

    }

);


   res.json({ message: "Logged in" });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

}


export async function me(req, res) {
    const admin = await findAdminById(req.admin.id);

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

    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    // حذف refresh token من DB
    if (refreshToken) {

      await deleteRefreshToken(refreshToken);

    }

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

    console.log(err);

    return res.status(500).json({
      message: "Logout failed"
    });

  }

}
export async function refresh(req, res) {

    try {

        const refreshToken =
            req.cookies.refreshToken;

        if (!refreshToken) {

            return res.status(401).json({
                message: "No refresh token"
            });

        }

        const savedToken =
    await findRefreshToken(refreshToken);

if (!savedToken) {
    return res.status(401).json({
        message: "Invalid refresh token"
    });
}
    if (savedToken.used) {
  await deleteAdminRefreshTokens(savedToken.admin_id);
  

  return res.status(401).json({
    message: "Refresh token reuse detected - session revoked"
  });
}


if (savedToken.expires_at < new Date()) {
    await deleteRefreshToken(refreshToken);

    return res.status(401).json({
        message: "Refresh token expired"
    });
}
if (savedToken.user_agent !== req.headers["user-agent"]) {
  // لا تحذفي كل السيشن مباشرة
  await deleteRefreshToken(refreshToken);

  return res.status(401).json({
    message: "Suspicious device change detected"
  });
}


let decoded;

try {
  decoded = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  await markRefreshTokenAsUsed(refreshToken);

} catch (err) {
  // token أصلاً invalid أو tampered
  await deleteRefreshToken(refreshToken);
  return res.status(401).json({
    message: "Invalid refresh token"
  });
}


        // إنشاء access token جديد
        const newAccessToken =
            jwt.sign(

                {
                    id: decoded.id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "15m"
                }

            );

        // إنشاء refresh token جديد
        const newRefreshToken =
            jwt.sign(

                {
                    id: decoded.id
                },

                process.env.REFRESH_TOKEN_SECRET,

                {
                    expiresIn: "7d"
                }

            );

      
await saveRefreshToken(
  newRefreshToken,
  decoded.id,
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  req.headers["user-agent"]
);
        // access token cookie
        res.cookie(

            "accessToken",

            newAccessToken,

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

        // refresh token cookie
        res.cookie(

            "refreshToken",

            newRefreshToken,

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
                    7 * 24 * 60 * 60 * 1000,
                    path: "/",
priority: "high"

            }

        );

        res.json({
            message: "Token refreshed"
        });

    } catch (error) {

        return res.status(401).json({
            message: "Refresh failed"
        });

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





