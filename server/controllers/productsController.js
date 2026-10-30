import Products from "../models/products.js";
import CategoryItems from "../models/categoryItems.js";

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

const parseImageUrls = (value) => {
  let imageUrls = value;
  if (typeof imageUrls === "string") {
    try {
      imageUrls = JSON.parse(imageUrls);
    } catch {
      return null;
    }
  }

  if (
    !Array.isArray(imageUrls) ||
    imageUrls.some(
      (url) =>
        typeof url !== "string" ||
        !url.trim() ||
        url.trim().toLowerCase().startsWith("blob:")
    )
  ) {
    return null;
  }

  return imageUrls.map((url) => url.trim());
};

const parseCategoryId = (value) => {
  if (value === undefined) return { valid: true, value: null };
  if (value === null || value === "") return { valid: true, value: null };
  if (typeof value !== "string" && typeof value !== "number") return { valid: false };
  const text = String(value);
  if (!/^\d+$/.test(text)) return { valid: false };
  const id = Number(text);
  return Number.isSafeInteger(id) && id > 0
    ? { valid: true, value: id }
    : { valid: false };
};

const getStoredImageUrls = (product) => {
  const imageUrls = Array.isArray(product.image_urls) ? product.image_urls : [];
  const storedImageUrls =
    imageUrls.length || !product.image_url ? imageUrls : [product.image_url];

  return storedImageUrls
    .filter(
      (url) =>
        typeof url === "string" &&
        url.trim() &&
        !url.trim().toLowerCase().startsWith("blob:")
    )
    .map((url) => url.trim());
};

const validateText = (value, field, maxLength = null) => {
  if (typeof value !== "string" || !value.trim()) {
    return `${field} is required.`;
  }
  if (typeof maxLength === "number" && value.trim().length > maxLength) {
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
  const {
    name,
    price: rawPrice,
    description,
    description_fr: rawDescriptionFr,
    skin_type: rawSkinType,
    category_id: rawCategoryId,
  } = req.body;
  const nameError = validateText(name, "Name", 200);
  const descriptionError = validateText(description, "Description");
  const price = parsePrice(rawPrice);
  const descriptionFr =
    rawDescriptionFr === undefined || rawDescriptionFr === null
      ? null
      : typeof rawDescriptionFr === "string"
        ? rawDescriptionFr.trim() || null
        : "";
  const invalidDescriptionFr =
    rawDescriptionFr !== undefined &&
    rawDescriptionFr !== null &&
    typeof rawDescriptionFr !== "string";
  const skinType = typeof rawSkinType === "string" ? rawSkinType.trim() : "";
  const invalidSkinType =
    rawSkinType !== undefined && typeof rawSkinType !== "string";
  const isActive =
    req.body.is_active === undefined ? true : parseActive(req.body.is_active);
  const category = parseCategoryId(rawCategoryId);

  if (
    nameError ||
    descriptionError ||
    invalidDescriptionFr ||
    price === null ||
    invalidSkinType ||
    !category.valid ||
    skinType.length > 100 ||
    isActive === null
  ) {
    return res.status(400).json({
      message:
        nameError ||
        descriptionError ||
        (invalidDescriptionFr
          ? "French description must be text or null."
          : price === null
            ? "Price must be a non-negative amount with up to two decimal places."
            : !category.valid
              ? "Category must be a valid category ID or empty."
              : invalidSkinType || skinType.length > 100
                ? "Skin type must be 100 characters or fewer."
                : "Active status must be true or false."),
    });
  }

  try {
    if (category.value !== null && !(await CategoryItems.getById(category.value))) {
      return res.status(400).json({ message: "Category not found." });
    }
    const product = await Products.create({
      name: name.trim(),
      price,
      description: description.trim(),
      description_fr: descriptionFr,
      skin_type: skinType || null,
      image_urls: (req.files || []).map((file) => file.path),
      is_active: isActive,
      category_id: category.value,
    });

    return res.status(201).json(await Products.getById(product.id));
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
    const descriptionFr =
      req.body.description_fr === undefined
        ? existing.description_fr
        : typeof req.body.description_fr === "string"
          ? req.body.description_fr.trim() || null
          : req.body.description_fr === null
            ? null
            : undefined;
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
    const retainedImageUrls =
      req.body.image_urls === undefined
        ? getStoredImageUrls(existing)
        : parseImageUrls(req.body.image_urls);
    const category =
      req.body.category_id === undefined
        ? { valid: true, value: existing.category_id ?? null }
        : parseCategoryId(req.body.category_id);

    const nameError = validateText(name, "Name", 200);
    const descriptionError = validateText(description, "Description");
    if (
      nameError ||
      descriptionError ||
      descriptionFr === undefined ||
      price === null ||
      skinType === undefined ||
      (typeof skinType === "string" && skinType.length > 100) ||
      isActive === null ||
      retainedImageUrls === null ||
      !category.valid
    ) {
      return res.status(400).json({
        message:
          nameError ||
          descriptionError ||
          (descriptionFr === undefined
            ? "French description must be text or null."
            : price === null
              ? "Price must be a non-negative amount with up to two decimal places."
              : skinType === undefined || (typeof skinType === "string" && skinType.length > 100)
                ? "Skin type must be 100 characters or fewer."
                : isActive === null
                  ? "Active status must be true or false."
                  : !category.valid
                    ? "Category must be a valid category ID or empty."
                    : "Image URLs must be an array of permanent URLs."),
      });
    }

    if (category.value !== null && !(await CategoryItems.getById(category.value))) {
      return res.status(400).json({ message: "Category not found." });
    }

    const uploadedImageUrls = (req.files || []).map((file) => file.path);
    const updated = await Products.update(id, {
      name: name.trim(),
      price,
      description: description.trim(),
      description_fr: descriptionFr,
      skin_type: skinType,
      image_urls: [...retainedImageUrls, ...uploadedImageUrls],
      is_active: isActive,
      category_id: category.value,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json(await Products.getById(updated.id));
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
