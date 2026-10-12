import db from "../config/db.js";

const Products = {
  getActive: async () => {
    const result = await db.query(
      `SELECT id, name, price, description, skin_type, image_url
       FROM public.products
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    return result.rows;
  },

  getAll: async () => {
    const result = await db.query(
      `SELECT * FROM public.products
       ORDER BY created_at DESC`
    );

    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      `SELECT * FROM public.products
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ?? null;
  },

  create: async ({ name, price, description, skin_type, image_url, is_active }) => {
    const result = await db.query(
      `INSERT INTO public.products
        (name, price, description, skin_type, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, price, description, skin_type, image_url, is_active]
    );

    return result.rows[0];
  },

  update: async (id, { name, price, description, skin_type, image_url, is_active }) => {
    const result = await db.query(
      `UPDATE public.products
       SET name = $1,
           price = $2,
           description = $3,
           skin_type = $4,
           image_url = $5,
           is_active = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, price, description, skin_type, image_url, is_active, id]
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
