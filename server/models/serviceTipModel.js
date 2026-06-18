import pool from "../config/db.js";

class ServiceTipModel {
  static async getByServiceId(serviceId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM service_tips
      WHERE service_id = $1
      ORDER BY type, tip_order ASC
      `,
      [serviceId]
    );

    return rows;
  }

  static async getByType(serviceId, type) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM service_tips
      WHERE service_id = $1
      AND type = $2
      ORDER BY tip_order ASC
      `,
      [serviceId, type]
    );

    return rows;
  }

  static async create(data) {
    const { rows } = await pool.query(
      `
      INSERT INTO service_tips
      (
        service_id,
        type,
        content,
        tip_order
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        data.service_id,
        data.type,
        data.content,
        data.tip_order || 1,
      ]
    );

    return rows[0];
  }

  static async update(id, data) {
    const { rows } = await pool.query(
      `
      UPDATE service_tips
      SET
        type = $1,
        content = $2,
        tip_order = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        data.type,
        data.content,
        data.tip_order,
        id,
      ]
    );

    return rows[0];
  }

  static async delete(id) {
    await pool.query(
      `
      DELETE FROM service_tips
      WHERE id = $1
      `,
      [id]
    );
  }
}

export default ServiceTipModel;