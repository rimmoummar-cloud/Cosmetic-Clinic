import express from 'express';
import db from '../config/db.js';

export const getMasseges = async () => {
  const res = await db.query('SELECT * FROM contact_messages');
  return res.rows;
};

export const createMasseges = async (data) => {
  const { name, email, message } = data;

  const result = await db.query(
    `INSERT INTO contact_messages 
    (name, email, message)
    VALUES ($1,$2,$3)
    RETURNING *`,
    [name, email, message]
  );

  return result.rows[0];
};