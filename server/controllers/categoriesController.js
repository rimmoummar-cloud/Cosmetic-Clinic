import * as Categorie from '../models/categories.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoriesById = async (req, res) => {
  const categories = await Categorie.getCategoriesById(req.params.id);
  res.json(categories);
};

export const createCategories = async (req, res) => {
  const categories = await Categorie.createCategories(req.body);
  res.json(categories);
};

export const updateCategories = async (req, res) => {
  const categories = await Categorie.updateCategories(
    req.params.id,
    req.body
  );
  res.json(categories);
};

export const deleteCategories = async (req, res) => {
  await Categorie.deleteCategories(req.params.id);
  res.json({ message: "service deleted" });
};