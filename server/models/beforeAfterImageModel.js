import pool from "../config/db.js";

class BeforeAfterImageModel {
  static async getByServiceId(serviceId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM before_after_images
      WHERE service_id = $1
      ORDER BY display_order ASC
      `,
      [serviceId]
    );

    return rows;
  }

  static async create(data) {
    const { rows } = await pool.query(
      `
      INSERT INTO before_after_images
      (
        service_id,
        before_image,
        after_image,
        title,
        description,
        display_order
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        data.service_id,
        data.before_image,
        data.after_image,
        data.title,
        data.description,
        data.display_order || 1,
      ]
    );

    return rows[0];
  }

  static async update(id, data) {
    const { rows } = await pool.query(
      `
      UPDATE before_after_images
      SET
        before_image = $1,
        after_image = $2,
        title = $3,
        description = $4,
        display_order = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        data.before_image,
        data.after_image,
        data.title,
        data.description,
        data.display_order,
        id,
      ]
    );

    return rows[0];
  }

  static async delete(id) {
    await pool.query(
      `
      DELETE FROM before_after_images
      WHERE id = $1
      `,
      [id]
    );
  }



static async getById(id) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM before_after_images
    WHERE id = $1
    `,
    [id]
  );

  return rows[0];
}




}






export default BeforeAfterImageModel;