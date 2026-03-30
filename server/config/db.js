// import pkg from "pg";

// const { Pool } = pkg;

// const db = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
// export default db;


//  import pkg from "pg";
// const { Pool } = pkg;

// const db = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "cosmetic_clinic",
//   password: "1234",
//   port: 5432
// });

// export default db;


import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // عشان يقرا .env

const { Pool } = pkg;

// تأكدي إنو process.env.DATABASE_URL موجودة وما فيها مسافات
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false // مهم مع Neon / AWS
  // }
  ssl: false
});

export default db;