
// import jwt from "jsonwebtoken";
// import { findAdminByEmail ,findAdminById} from "../models/auth.js";

// import {
//     saveRefreshToken
// } from "../models/refreshTokenModel.js";

// import {
//     blacklistToken
// } from "../models/tokenBlacklist.js";

// import {
//     findRefreshToken
// }
// from "../models/refreshTokenModel.js";
// import bcrypt from "bcrypt";
// import { createAdmin } from "../models/auth.js";
import {markRefreshTokenAsUsed} from "../models/refreshTokenModel.js";
import {deleteAdminRefreshTokens} from "../models/refreshTokenModel.js";
import { loginSchema } from "../validators/authValidation.js";
import jwt from "jsonwebtoken";
import { findAdminByEmail, findAdminById } from "../models/auth.js";
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

//         const { email, password } = req.body;

// const validation =
//     loginSchema.safeParse(req.body);

// if (!validation.success) {

//     return res.status(400).json({
//         message: "Invalid input"
//     });

// }


        

        const admin =
            await findAdminByEmail(email);

     

        // if (!admin) {

        //     return res.status(401).json({
        //         message: "Admin not found"
        //     });

        // }
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

     

        // if (!isMatch) {

        //     return res.status(401).json({
        //         message: "Wrong password"
        //     });

        // }
        if (!isMatch) {
  return res.status(401).json({
    message: "Invalid credentials"
  });
}

        // const token =
        //     jwt.sign(
        //         {
        //             id: admin.id,
        //             email: admin.email
        //         },
        //         process.env.JWT_SECRET,
        //         {
        //             expiresIn: "8h"
        //         }
        //     );
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
//     await saveRefreshToken(

//     refreshToken,

//     admin.id,

//     new Date(
//         Date.now() +
//         7 * 24 * 60 * 60 * 1000
//     )

// );
await saveRefreshToken(
  refreshToken,
  admin.id,
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  req.headers["user-agent"]
);
        // res.json({ token });
     // 🔥 هون التغيير الحقيقي
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: false, // خليها false لو localhost
        //     sameSite: "lax",
        //     maxAge: 8 * 60 * 60 * 1000
        // });

// res.cookie("token", token, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//   maxAge: 8 * 60 * 60 * 1000
// });
res.cookie(

    "accessToken",

    accessToken,

    {

        httpOnly: true,

        secure:
            process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",

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

        secure:
            process.env.NODE_ENV === "production",

        sameSite:
            process.env.NODE_ENV === "production"
                ? "none"
                : "lax",

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



// export async function register(req, res) {

//     try {

//         const { email, password } = req.body;

//         if (!email || !password) {

//             return res.status(400).json({
//                 message: "Email and password required"
//             });

//         }

//         const hashedPassword =
//             await bcrypt.hash(password, 10);

//         const admin =
//             await createAdmin(
//                 email,
//                 hashedPassword
//             );

//         res.status(201).json({
//             message: "Admin created",
//             admin
//         });

//     } catch (error) {

//         console.error(error);

//         res.status(500).json({
//             message: "Server error"
//         });

//     }

// }

// export async function me(req, res) {
//     return res.json({
//         admin: req.admin
//     });
// }
export async function me(req, res) {
    const admin = await findAdminById(req.admin.id);

    return res.json({
        admin: {
            id: admin.id,
            email: admin.email
        }
    });
}

// export function logout(req, res) {
//   res.clearCookie("token", {
//     httpOnly: true,
//     sameSite: "lax",
//   secure: process.env.NODE_ENV === "production"
//   });

//   res.json({ message: "Logged out" });
// }
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

  secure:
    process.env.NODE_ENV === "production",

  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  path: "/"

});

    res.clearCookie("refreshToken", {

      httpOnly: true,

      secure:
        process.env.NODE_ENV === "production",

      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax"

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
// if (savedToken.user_agent !== req.headers["user-agent"]) {
//   await deleteAdminRefreshTokens(savedToken.admin_id);

//   return res.status(401).json({
//     message: "Device mismatch detected"
//   });
// }
        // تحقق من DB
//      const savedToken =
//     await findRefreshToken(refreshToken);

// if (!savedToken) {

//     return res.status(401).json({
//         message: "Invalid refresh token"
//     });

// }

// if (savedToken.expires_at < new Date()) {

//     await deleteRefreshToken(refreshToken);

//     return res.status(401).json({
//         message: "Refresh token expired"
//     });

// }

        // if (!savedToken) {

        //     return res.status(401).json({
        //         message: "Invalid refresh token"
        //     });

        // }

        // تحقق JWT
        // const decoded =
        //     jwt.verify(

        //         refreshToken,

        //         process.env
        //             .REFRESH_TOKEN_SECRET

        //     );
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
// await markRefreshTokenAsUsed(refreshToken);
        // حذف القديم
        // await deleteRefreshToken(
        //     refreshToken
        // );

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

        // حفظ refresh الجديد
        // await saveRefreshToken(

        //     newRefreshToken,

        //     decoded.id,

        //     new Date(
        //         Date.now() +
        //         7 * 24 * 60 * 60 * 1000
        //     )

        // );
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

                secure:
                    process.env.NODE_ENV === "production",

                sameSite:
                    process.env.NODE_ENV === "production"
                        ? "none"
                        : "lax",

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

                secure:
                    process.env.NODE_ENV === "production",

                sameSite:
                    process.env.NODE_ENV === "production"
                        ? "none"
                        : "lax",

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