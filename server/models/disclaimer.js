
import db from "../config/db.js";

export const getDisclaimersByBookingId =
  async (bookingId) => {

    const result = await db.query(
      `
      SELECT DISTINCT
        sd.id,
        sd.title,
        sd.description,
        sd.type,
        sd.service_id,
        sd.is_active,
        sd.created_at,

        s.name AS service_name

      FROM booking_services bs

      JOIN service_disclaimers sd
        ON sd.service_id = bs.service_id

      JOIN services s
        ON s.id = sd.service_id

      WHERE bs.booking_id = $1
      AND sd.is_active = true
      `,
      [bookingId]
    );

    return result.rows;
  };
  
export const createDisclaimer =
  async ({
    service_id,
    title,
    description,
    type,
  }) => {

    const result = await db.query(
      `
      INSERT INTO service_disclaimers
      (
        service_id,
        title,
        description,
        type
      )
      VALUES ($1, $2, $3, $4)

      RETURNING *
      `,
      [
        service_id,
        title,
        description,
        type || "warning",
      ]
    );

    return result.rows[0];



    
  };

export const updateDisclaimer =
  async (
    id,
    {
      title,
      description,
      type,
      service_id,
    }
  ) => {

    const result = await db.query(
      `
      UPDATE service_disclaimers

      SET
        title = $1,
        description = $2,
        type = $3,
        service_id = $4

      WHERE id = $5

      RETURNING *
      `,
      [
        title,
        description,
        type,
        service_id,
        id,
      ]
    );

    return result.rows[0];
  };

export const toggleDisclaimerStatus =
  async (
    id,
    is_active
  ) => {

    const result = await db.query(
      `
      UPDATE service_disclaimers

      SET is_active = $1

      WHERE id = $2

      RETURNING *
      `,
      [is_active, id]
    );

    return result.rows[0];
  };

// export const getAllDisclaimers =
//   async () => {

//     const result = await db.query(
//       `
//       SELECT *

//       FROM service_disclaimers

//       ORDER BY created_at DESC
//       `
//     );

//     return result.rows;
//   };
export const getAllDisclaimers =
  async () => {

    const result = await db.query(
      `
      SELECT
        sd.*,
        s.name AS service_name

      FROM service_disclaimers sd

      JOIN services s
        ON s.id = sd.service_id

      ORDER BY sd.created_at DESC
      `
    );

    return result.rows;
  };
export const getDisclaimerById =
  async (id) => {

    const result = await db.query(
      `
      SELECT
        sd.*,
        s.name AS service_name

      FROM service_disclaimers sd

      JOIN services s
        ON s.id = sd.service_id

      WHERE sd.id = $1
      `,
      [id]
    );

    return result.rows[0];
  };



  export const deleteDisclaimer =
  async (id) => {

    const result = await db.query(
      `
      DELETE FROM service_disclaimers
      WHERE id = $1

      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  };




  export const getDisclaimersByToken =
  async (token) => {

    const result = await db.query(
      `
      SELECT DISTINCT
        sd.id,
        sd.title,
        sd.description,
        sd.type,
        sd.service_id,
        sd.is_active,
        sd.created_at,

        s.name AS service_name

      FROM bookings b

      JOIN booking_services bs
        ON bs.booking_id = b.id

      JOIN service_disclaimers sd
        ON sd.service_id = bs.service_id

      JOIN services s
        ON s.id = sd.service_id

      WHERE b.acceptance_token = $1
      AND sd.is_active = true
      `,
      [token]
    );

    return result.rows;
  };