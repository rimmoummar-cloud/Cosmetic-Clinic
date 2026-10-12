import Products from "../models/products.js";

const parseId = (value) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const parsePrice = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d+(?:\.\d{1,2})?$/.test(value.trim())
  ) {
    return null;
  }

  const price = Number(value);
  return Number.isFinite(price) && price <= 99999999.99 ? price : null;
};

const parseActive = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
};

const validateText = (value, field, maxLength) => {
  if (typeof value !== "string" || !value.trim()) {
    return `${field} is required.`;
  }
  if (maxLength && value.trim().length > maxLength) {
    return `${field} must be ${maxLength} characters or fewer.`;
  }
  return null;
};

export const getActiveProducts = async (req, res) => {
  try {
    res.json(await Products.getActive());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProductsForAdmin = async (req, res) => {
  try {
    res.json(await Products.getAll());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, price: rawPrice, description, skin_type: rawSkinType } = req.body;
  const nameError = validateText(name, "Name", 200);
  const descriptionError = validateText(description, "Description");
  const price = parsePrice(rawPrice);
  const skinType = typeof rawSkinType === "string" ? rawSkinType.trim() : "";
  const invalidSkinType =
    rawSkinType !== undefined && typeof rawSkinType !== "string";
  const isActive =
    req.body.is_active === undefined ? true : parseActive(req.body.is_active);

  if (
    nameError ||
    descriptionError ||
    price === null ||
    invalidSkinType ||
    skinType.length > 100 ||
    isActive === null
  ) {
    return res.status(400).json({
      message:
        nameError ||
        descriptionError ||
        (price === null
          ? "Price must be a non-negative amount with up to two decimal places."
          : invalidSkinType || skinType.length > 100
            ? "Skin type must be 100 characters or fewer."
            : "Active status must be true or false."),
    });
  }

  try {
    const product = await Products.create({
      name: name.trim(),
      price,
      description: description.trim(),
      skin_type: skinType || null,
      image_url: req.file?.path || null,
      is_active: isActive,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const existing = await Products.getById(id);
    if (!existing) {
      return res.status(404).json({ message: "Product not found." });
    }

    const name = req.body.name === undefined ? existing.name : req.body.name;
    const description =
      req.body.description === undefined
        ? existing.description
        : req.body.description;
    const price =
      req.body.price === undefined ? Number(existing.price) : parsePrice(req.body.price);
    const skinType =
      req.body.skin_type === undefined
        ? existing.skin_type
        : typeof req.body.skin_type === "string"
          ? req.body.skin_type.trim() || null
          : undefined;
    const isActive =
      req.body.is_active === undefined
        ? existing.is_active
        : parseActive(req.body.is_active);

    const nameError = validateText(name, "Name", 200);
    const descriptionError = validateText(description, "Description");
    if (
      nameError ||
      descriptionError ||
      price === null ||
      skinType === undefined ||
      (typeof skinType === "string" && skinType.length > 100) ||
      isActive === null
    ) {
      return res.status(400).json({
        message:
          nameError ||
          descriptionError ||
          (price === null
            ? "Price must be a non-negative amount with up to two decimal places."
            : skinType === undefined || (typeof skinType === "string" && skinType.length > 100)
              ? "Skin type must be 100 characters or fewer."
              : "Active status must be true or false."),
      });
    }

    const updated = await Products.update(id, {
      name: name.trim(),
      price,
      description: description.trim(),
      skin_type: skinType,
      image_url: req.file?.path || existing.image_url,
      is_active: isActive,
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid product ID." });
  }

  try {
    const deleted = await Products.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
