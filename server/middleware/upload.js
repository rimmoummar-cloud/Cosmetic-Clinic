import multer from "multer";
import path from "path";
import fs from "fs";

const createUpload = (moduleName = "before-after") => {
  const dir = `uploads/${moduleName}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, dir);
    },

    filename(req, file, cb) {
      const ext =
        path.extname(file.originalname);

      cb(
        null,
        Date.now() +
          "-" +
          Math.round(Math.random() * 1e9) +
          ext
      );
    },
  });

  return multer({
    storage,
    fileFilter,
  });
};

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    file.mimetype.startsWith(
      "image/"
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images allowed"
      )
    );
  }
};

export { createUpload };

export default createUpload();
