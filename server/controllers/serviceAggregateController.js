import pool from "../config/db.js";

export const getFullService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const [
      service,
      details,
      benefits,
      tips,
      faqs,
      beforeAfterImages,
      suitableFor,
      contraindications,
      relatedServices,
    ] = await Promise.all([
      pool.query(
        `
        SELECT *
        FROM services
        WHERE id = $1
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM service_details
        WHERE service_id = $1
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM service_benefits
        WHERE service_id = $1
        ORDER BY benefit_order
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM service_tips
        WHERE service_id = $1
        ORDER BY type, tip_order
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM service_faqs
        WHERE service_id = $1
        ORDER BY faq_order
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM before_after_images
        WHERE service_id = $1
        ORDER BY display_order
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM suitable_for_items
        WHERE service_id = $1
        ORDER BY display_order
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT *
        FROM contraindications
        WHERE service_id = $1
        ORDER BY display_order
        `,
        [serviceId]
      ),

      pool.query(
        `
        SELECT
          rs.related_service_id,
          s.name,
          s.image_url,
          s.price
        FROM related_services rs
        JOIN services s
          ON s.id = rs.related_service_id
        WHERE rs.service_id = $1
        `,
        [serviceId]
      ),
    ]);

    return res.json({
      success: true,
      data: {
        service: service.rows[0] || null,
        details: details.rows[0] || null,
        benefits: benefits.rows,
        tips: tips.rows,
        faqs: faqs.rows,
        beforeAfterImages: beforeAfterImages.rows,
        suitableFor: suitableFor.rows,
        contraindications: contraindications.rows,
        relatedServices: relatedServices.rows,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};