import pool from "../config/db.js";

class ServiceDetailModel {
  static async getByServiceId(serviceId) {
    const query = `
      SELECT *
      FROM service_details
      WHERE service_id = $1
    `;

    const { rows } = await pool.query(query, [serviceId]);
    return rows[0];
  }

  static async create(data) {
    const query = `
      INSERT INTO service_details (
        service_id,
        short_description,
        long_description,
        why_choose_this,
        suitable_for,
        not_suitable_for,
        precautions,
        preparation,
        recovery
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;

    const values = [
      data.service_id,
      data.short_description,
      data.long_description,
      data.why_choose_this,
      data.suitable_for,
      data.not_suitable_for,
      data.precautions,
      data.preparation,
      data.recovery,
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE service_details
      SET
        short_description = $1,
        long_description = $2,
        why_choose_this = $3,
        suitable_for = $4,
        not_suitable_for = $5,
        precautions = $6,
        preparation = $7,
        recovery = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      data.short_description,
      data.long_description,
      data.why_choose_this,
      data.suitable_for,
      data.not_suitable_for,
      data.precautions,
      data.preparation,
      data.recovery,
      id,
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
  }

  static async delete(id) {
    await pool.query(
      `
      DELETE FROM service_details
      WHERE id = $1
    `,
      [id]
    );
  }
}

export default ServiceDetailModel;