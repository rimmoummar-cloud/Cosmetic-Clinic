import pool from "../config/db.js";

class ServiceBenefitModel {
  static async getByServiceId(serviceId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM service_benefits
      WHERE service_id = $1
      ORDER BY benefit_order ASC
      `,
      [serviceId]
    );

    return rows;
  }

  static async create(data) {
    const { rows } = await pool.query(
      `
      INSERT INTO service_benefits
      (
        service_id,
        title,
        description,
        benefit_order
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        data.service_id,
        data.title,
        data.description,
        data.benefit_order || 1,
      ]
    );

    return rows[0];
  }

  static async update(id, data) {
    const { rows } = await pool.query(
      `
      UPDATE service_benefits
      SET
        title = $1,
        description = $2,
        benefit_order = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        data.title,
        data.description,
        data.benefit_order,
        id,
      ]
    );

    return rows[0];
  }

  static async delete(id) {
    await pool.query(
      `
      DELETE FROM service_benefits
      WHERE id = $1
      `,
      [id]
    );
  }
}

export default ServiceBenefitModel;