import db from "../config/db.js";

const DEFAULT_SECTIONS = [
  "service-detail",
  "benefits",
  "tips",
  "faqs",
  "before-after",
  "contraindications",
  "related-services",
];

export const createDefaultServiceSections = async (serviceId) => {
  const values = DEFAULT_SECTIONS.map((sectionKey) => [
    serviceId,
    sectionKey,
  ]);

  const placeholders = values
    .map(
      (_, index) =>
        `($${index * 2 + 1}, $${index * 2 + 2}, TRUE)`
    )
    .join(", ");

  const params = values.flat();

  const result = await db.query(
    `
      INSERT INTO service_sections
        (service_id, section_key, is_enabled)
      VALUES ${placeholders}
      ON CONFLICT (service_id, section_key)
      DO NOTHING
      RETURNING *;
    `,
    params
  );

  return result.rows;
};

export const createServiceSection = async ({
  serviceId,
  sectionKey,
  isEnabled = true,
}) => {
  const result = await db.query(
    `
      INSERT INTO service_sections
        (service_id, section_key, is_enabled)
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
    [serviceId, sectionKey, isEnabled]
  );

  return result.rows[0];
};

export const updateServiceSection = async ({
  serviceId,
  sectionKey,
  isEnabled,
}) => {
  const result = await db.query(
    `
      UPDATE service_sections
      SET
        is_enabled = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE service_id = $2
        AND section_key = $3
      RETURNING *;
    `,
    [isEnabled, serviceId, sectionKey]
  );

  return result.rows[0];
};

export const getServiceSections = async (serviceId) => {
  const result = await db.query(
    `
      SELECT
        id,
        service_id,
        section_key,
        is_enabled,
        created_at,
        updated_at
      FROM service_sections
      WHERE service_id = $1
      ORDER BY section_key ASC;
    `,
    [serviceId]
  );

  return result.rows;
};