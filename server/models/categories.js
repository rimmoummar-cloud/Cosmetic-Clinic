import express from 'express';
import db from '../config/db.js';

export const getAllCategories = async () => {
  const res = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
  return res.rows;
};





export const getCategoriesById = async (id) => {
  const result = await db.query(
    "SELECT * FROM categories WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const createCategories = async (data) => {
  const { name, description, image_url =null} = data;

  const result = await db.query(
    `INSERT INTO categories 
    (name, description, image_url)
    VALUES ($1,$2,$3)
    RETURNING *`,
    [name, description, image_url]
  );

  return result.rows[0];
};

export const updateCategories = async (id, data) => {
  const { name, description, image_url } = data;

  const result = await db.query(
    `UPDATE categories 
     SET name=$1, description=$2, image_url=$3
     WHERE id=$4
     RETURNING *`,
    [name, description, image_url, id]
  );

  return result.rows[0];
};

export const deleteCategories = async (id) => {
  await db.query("DELETE FROM categories WHERE id=$1", [id]);
};