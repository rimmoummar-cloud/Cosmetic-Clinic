import express from 'express';
import db from '../config/db.js';

export const getAllCategories = async () => {
  const res = await db.query(
    'SELECT * FROM public.categories ORDER BY "order" ASC NULLS LAST, id ASC'
  );
  return res.rows;
};





export const getCategoriesById = async (id) => {
  const result = await db.query(
    'SELECT * FROM public.categories WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const createCategories = async (data) => {
  const { name, description, description_fr, long_description, image_url = null, order = null } = data;

  const result = await db.query(
    `INSERT INTO categories 
    (name, description, description_fr, long_description, image_url, "order")
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [name, description, description_fr ?? null, long_description, image_url, order]
  );

  return result.rows[0];
};

export const updateCategories = async (id, data) => {
  const { name, description, description_fr, long_description, image_url, order = null } = data;

  const result = await db.query(
    `UPDATE categories 
     SET name=$1, description=$2, description_fr=$3, long_description=$4, image_url=$5, "order"=$6
     WHERE id=$7
     RETURNING *`,
    [name, description, description_fr ?? null, long_description, image_url, order, id]
  );

  return result.rows[0];
};

export const deleteCategories = async (id) => {
  await db.query("DELETE FROM categories WHERE id=$1", [id]);
};
