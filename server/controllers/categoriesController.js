import * as Categorie from '../models/categories.js';

const parseDisplayOrder = (rawValue) => {
  if (rawValue === undefined || rawValue === null || (typeof rawValue === "string" && !rawValue.trim())) {
    return { valid: true, value: null };
  }
  if (typeof rawValue !== "string" && typeof rawValue !== "number") {
    return { valid: false };
  }
  const value = String(rawValue).trim();
  if (!/^-?\d+$/.test(value)) return { valid: false };
  const order = Number(value);
  return Number.isSafeInteger(order) && order >= -2147483648 && order <= 2147483647
    ? { valid: true, value: order }
    : { valid: false };
};

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
  const displayOrder = parseDisplayOrder(req.body.order);
  if (!displayOrder.valid) {
    return res.status(400).json({ message: "Display order must be a whole number or empty." });
  }
  const imageUrl = req.file?.path || "";

  const categories = await Categorie.createCategories({
    ...req.body,
    description_fr: req.body.description_fr ?? null,
    image_url: imageUrl,
    order: displayOrder.value,
  });

  res.json(categories);
};

export const updateCategories = async (req, res) => {
  const oldCategory = await Categorie.getCategoriesById(req.params.id);
  if (!oldCategory) {
    return res.status(404).json({ message: "Category not found." });
  }
  const displayOrder = Object.prototype.hasOwnProperty.call(req.body, "order")
    ? parseDisplayOrder(req.body.order)
    : { valid: true, value: oldCategory.order ?? null };
  if (!displayOrder.valid) {
    return res.status(400).json({ message: "Display order must be a whole number or empty." });
  }
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
      name: req.body.name === undefined ? oldCategory.name : req.body.name,
      description: req.body.description === undefined ? oldCategory.description : req.body.description,
      long_description: req.body.long_description === undefined ? oldCategory.long_description : req.body.long_description,
      description_fr:
        req.body.description_fr === undefined
          ? oldCategory?.description_fr ?? null
          : req.body.description_fr === ""
            ? null
            : req.body.description_fr,
      image_url: imageUrl,
      order: displayOrder.value,
    }
  );
  res.json(categories);
};

export const deleteCategories = async (req, res) => {
  await Categorie.deleteCategories(req.params.id);
  res.json({ message: "service deleted" });
};
