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
  const imageUrl = req.file?.path || "";

  const categories = await Categorie.createCategories({
    ...req.body,
    description_fr: req.body.description_fr ?? null,
    image_url: imageUrl,
  });

  res.json(categories);
};

export const updateCategories = async (req, res) => {
  const oldCategory = await Categorie.getCategoriesById(req.params.id);
  const hasImageUrl = Object.prototype.hasOwnProperty.call(
    req.body,
    "image_url"
  );
  const imageUrl =
    req.file?.path ||
    (hasImageUrl
      ? req.body.image_url
      : oldCategory?.image_url);

  const categories = await Categorie.updateCategories(
    req.params.id,
    {
      ...req.body,
      description_fr:
        req.body.description_fr === undefined
          ? oldCategory?.description_fr ?? null
          : req.body.description_fr === ""
            ? null
            : req.body.description_fr,
      image_url: imageUrl,
    }
  );
  res.json(categories);
};

export const deleteCategories = async (req, res) => {
  await Categorie.deleteCategories(req.params.id);
  res.json({ message: "service deleted" });
};
