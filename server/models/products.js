import db from "../config/db.js";

const Products = {
  getActive: async () => {
    const result = await db.query(
      `SELECT products.id, products.name, products.price, products.description,
              products.description_fr, products.skin_type, products.image_urls,
              products.category_id, ci.name AS category_name,
              ci.description AS category_description, ci.name_fr AS category_name_fr,
              ci.description_fr AS category_description_fr
       FROM public.products
       LEFT JOIN public.categoriesitem ci ON ci.id = products.category_id
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    return result.rows;
  },

  getAll: async () => {
    const result = await db.query(
      `SELECT products.*, ci.name AS category_name, ci.description AS category_description,
              ci.name_fr AS category_name_fr, ci.description_fr AS category_description_fr
       FROM public.products
       LEFT JOIN public.categoriesitem ci ON ci.id = products.category_id
       ORDER BY products.created_at DESC`
    );

    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      `SELECT products.*, ci.name AS category_name, ci.description AS category_description,
              ci.name_fr AS category_name_fr, ci.description_fr AS category_description_fr
       FROM public.products
       LEFT JOIN public.categoriesitem ci ON ci.id = products.category_id
       WHERE products.id = $1`,
      [id]
    );

    return result.rows[0] ?? null;
  },

  create: async ({ name, price, description, description_fr, skin_type, image_urls, is_active, category_id }) => {
    const result = await db.query(
      `INSERT INTO public.products
        (name, price, description, description_fr, skin_type, image_urls, is_active, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, price, description, description_fr ?? null, skin_type, image_urls, is_active, category_id ?? null]
    );

    return result.rows[0];
  },

  update: async (id, { name, price, description, description_fr, skin_type, image_urls, is_active, category_id }) => {
    const result = await db.query(
      `UPDATE public.products
       SET name = $1,
           price = $2,
           description = $3,
           description_fr = $4,
           skin_type = $5,
           image_urls = COALESCE($6::text[], image_urls),
           is_active = $7,
           category_id = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, price, description, description_fr ?? null, skin_type, image_urls ?? null, is_active, category_id ?? null, id]
    );

    return result.rows[0] ?? null;
  },

  delete: async (id) => {
    const result = await db.query(
      `DELETE FROM public.products
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    return result.rows[0] ?? null;
  },
};

export default Products;
