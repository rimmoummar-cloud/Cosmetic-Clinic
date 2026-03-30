import * as Massege from '../models/boxContect.js';

export const getMassege = async (req, res) => {
  const massege = await Massege.getMasseges();
  res.json(massege);
};

export const createMassege = async (req, res) => {
  const massege = await Massege.createMasseges(req.body);
  res.json(massege);
};
