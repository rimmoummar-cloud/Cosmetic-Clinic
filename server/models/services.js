// in this file you put the scema or what you wont from this table every table in the db have a file here if you want from this table any thing
// in controllers folder you put the logic 
//in this file i put the http the end point for the front end to call it in the fivh in the front end
//in the middlewares folder put in it the permition that should the request path it like auth or validation before can pass the controller folder 
//in tne utils put any function note relate to data base or i dont need when i creat this function need to used a qery or connect to the databse
// in the utils folder put the function that will help me in the other function like email sender or validation, so this function it note relate to spacific table that can i do it in the model its just a functiion i want it to help me in something
import express from 'express';
import db from '../config/db.js';

export const getAllServices = async () => {
  const res = await db.query('SELECT * FROM services ORDER BY created_at DESC');
  return res.rows;
};

export const getActiveServices = async () => {
  const res = await db.query('SELECT * FROM services  WHERE is_active = TRUE');
  return res.rows;
};


export const getServiceById = async (id) => {
  const result = await db.query(
    "SELECT * FROM services WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

export const getServiceByCategoryId = async (id) => {
  const result = await db.query(
    "SELECT * FROM services WHERE category_id = $1 AND  is_active = TRUE",
    [id]
  );
  return result.rows;
};




export const createService = async (data) => {
  const { name, description, price, duration_minutes, category_id } = data;

  const result = await db.query(
    `INSERT INTO services 
    (name, description, price, duration_minutes, category_id)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [name, description, price, duration_minutes, category_id]
  );

  return result.rows[0];
};

export const updateService = async (id, data) => {
  const {
    category_id,
    name,
    description,
    price,
    duration_minutes,
    image_url,
    is_active,
  } = data;

  const result = await db.query(
    `UPDATE services 
     SET 
       category_id = $1,
       name = $2,
       description = $3,
       price = $4,
       duration_minutes = $5,
       image_url = $6,
       is_active = $7
     WHERE id = $8
     RETURNING *`,
    [
      category_id,
      name,
      description,
      price,
      duration_minutes,
      image_url,
      is_active,
      id,
    ]
  );

  return result.rows[0];
};
export const deleteService = async (id) => {
  await db.query("DELETE FROM services WHERE id=$1", [id]);
};