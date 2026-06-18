import pool from "../config/db.js";

class RelatedServiceModel {
  static async getByServiceId(serviceId) {
    const { rows } = await pool.query(
      `
      SELECT rs.*,
             s2.name AS related_service_name,
             s2.image_url AS related_service_image
      FROM related_services rs
      JOIN services s2 ON s2.id = rs.related_service_id
      WHERE rs.service_id = $1
      `,
      [serviceId]
    );

    return rows;
  }

  static async create(data) {
    const { rows } = await pool.query(
      `
      INSERT INTO related_services
      (service_id, related_service_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [
        data.service_id,
        data.related_service_id,
      ]
    );

    return rows[0];
  }

  static async delete(serviceId, relatedId) {
    await pool.query(
      `
      DELETE FROM related_services
      WHERE service_id = $1
      AND related_service_id = $2
      `,
      [serviceId, relatedId]
    );
  }
}

export default RelatedServiceModel;