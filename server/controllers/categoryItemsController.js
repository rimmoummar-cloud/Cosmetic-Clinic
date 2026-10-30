import CategoryItems from "../models/categoryItems.js";

const parseId = (value) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const normalizeText = (value, field, { required = false, maxLength = null } = {}) => {
  if (value === undefined || value === null || value === "") {
    return required ? { error: `${field} is required.` } : { value: null };
  }
  if (typeof value !== "string") return { error: `${field} must be text.` };
  const text = value.trim();
  if (required && !text) return { error: `${field} is required.` };
  if (maxLength && text.length > maxLength) {
    return { error: `${field} must be ${maxLength} characters or fewer.` };
  }
  return { value: text || null };
};

const parseFields = (body, existing = {}) => {
  const values = {};
  const definitions = [
    ["name", "Name", true, 200],
    ["description", "Description", false],
    ["name_fr", "French name", false, 200],
    ["description_fr", "French description", false],
  ];
  for (const [key, label, required, maxLength] of definitions) {
    const raw = body[key] === undefined ? existing[key] : body[key];
    const parsed = normalizeText(raw, label, { required, maxLength });
    if (parsed.error) return { error: parsed.error };
    values[key] = parsed.value;
  }
  return { values };
};

export const getAllCategoryItems = async (_req, res) => {
  try {
    return res.json(await CategoryItems.getAll());
  } catch (error) {
    return res.status(500).json({ message: "Unable to load categories." });
  }
};

export const getCategoryItemById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid category ID." });
  try {
    const category = await CategoryItems.getById(id);
    return category ? res.json(category) : res.status(404).json({ message: "Category not found." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load category." });
  }
};

export const createCategoryItem = async (req, res) => {
  const parsed = parseFields(req.body);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  try {
    return res.status(201).json(await CategoryItems.create(parsed.values));
  } catch (error) {
    return res.status(500).json({ message: "Unable to create category." });
  }
};

export const updateCategoryItem = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid category ID." });
  try {
    const existing = await CategoryItems.getById(id);
    if (!existing) return res.status(404).json({ message: "Category not found." });
    const parsed = parseFields(req.body, existing);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const updated = await CategoryItems.update(id, parsed.values);
    return updated ? res.json(updated) : res.status(404).json({ message: "Category not found." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update category." });
  }
};

export const deleteCategoryItem = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid category ID." });
  try {
    const deleted = await CategoryItems.delete(id);
    return deleted ? res.json({ message: "Category deleted successfully." }) : res.status(404).json({ message: "Category not found." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete category." });
  }
};
