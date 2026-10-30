import db from "../config/db.js";

const CategoryItems = {
  getAll: async () => {
    const result = await db.query(
      `SELECT id, name, description, name_fr, description_fr
       FROM public.categoriesitem ORDER BY id`
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      `SELECT id, name, description, name_fr, description_fr
       FROM public.categoriesitem WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  create: async ({ name, description, name_fr, description_fr }) => {
    const result = await db.query(
      `INSERT INTO public.categoriesitem (name, description, name_fr, description_fr)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, name_fr, description_fr`,
      [name, description, name_fr, description_fr]
    );
    return result.rows[0];
  },

  update: async (id, { name, description, name_fr, description_fr }) => {
    const result = await db.query(
      `UPDATE public.categoriesitem
       SET name = $1, description = $2, name_fr = $3, description_fr = $4
       WHERE id = $5
       RETURNING id, name, description, name_fr, description_fr`,
      [name, description, name_fr, description_fr, id]
    );
    return result.rows[0] ?? null;
  },

  delete: async (id) => {
    const result = await db.query(
      "DELETE FROM public.categoriesitem WHERE id = $1 RETURNING id",
      [id]
    );
    return result.rows[0] ?? null;
  },
};

export default CategoryItems;
