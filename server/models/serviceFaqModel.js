import pool from "../config/db.js";

class ServiceFaqModel {
  static async getByServiceId(serviceId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM service_faqs
      WHERE service_id = $1
      ORDER BY faq_order ASC
      `,
      [serviceId]
    );

    return rows;
  }

  static async create(data) {
    const { rows } = await pool.query(
      `
      INSERT INTO service_faqs
      (
        service_id,
        question,
        answer,
        faq_order
      )
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        data.service_id,
        data.question,
        data.answer,
        data.faq_order || 1,
      ]
    );

    return rows[0];
  }

  static async update(id, data) {
    const { rows } = await pool.query(
      `
      UPDATE service_faqs
      SET
        question = $1,
        answer = $2,
        faq_order = $3
      WHERE id = $4
      RETURNING *
      `,
      [
        data.question,
        data.answer,
        data.faq_order,
        id,
      ]
    );

    return rows[0];
  }

  static async delete(id) {
    await pool.query(
      `
      DELETE FROM service_faqs
      WHERE id = $1
      `,
      [id]
    );
  }
}

export default ServiceFaqModel;