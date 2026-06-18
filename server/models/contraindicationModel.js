import pool from "../config/db.js";

class ContraindicationModel {
  static async getByServiceId(serviceId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM contraindications
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
      INSERT INTO contraindications
      (service_id, title, description, display_order)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        data.service_id,
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
      UPDATE contraindications
      SET
        title = $1,
        description = $2,
        display_order = $3
      WHERE id = $4
      RETURNING *
      `,
      [
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
      DELETE FROM contraindications
      WHERE id = $1
      `,
      [id]
    );
  }
}

export default ContraindicationModel;