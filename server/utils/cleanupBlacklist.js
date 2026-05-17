import db from "../config/db.js";

export async function cleanupBlacklist() {

    await db.query(

        `
        DELETE FROM token_blacklist
        WHERE expires_at < NOW()
        `

    );

    console.log(
        "Expired blacklisted tokens cleaned"
    );

}