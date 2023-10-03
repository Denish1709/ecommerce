const express = require("express");
const router = express.Router();
const multer = require("multer");

// setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log(req.file);
    // send back the image url
    const image_url = req.file.path;
    res.status(200).send({ image_url: image_url });
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
