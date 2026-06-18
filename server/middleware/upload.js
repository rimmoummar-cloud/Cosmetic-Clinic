import multer from "multer";
import path from "path";
import fs from "fs";

const dir = "uploads/before-after";

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

export default multer({
  storage,
  fileFilter,
});