import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "clinic",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only images allowed"));
};

const upload = multer({ storage, fileFilter });

export default upload;