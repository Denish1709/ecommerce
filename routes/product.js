const express = require("express");
const router = express.Router();

const Product = require("../models/product");

router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    res.status(200).send(await Product.find(filter).sort({ _id: -1 }));
  } catch (error) {
    res.status(400).send({ message: "Product not found" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await Product.findOne({ _id: req.params.id });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send({ message: "Product not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
    });
    await newProduct.save();
    res.status(200).send(newProduct);
  } catch {
    res.status(400).send({ message: error._message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const product_id = req.params.id;

    const updatedProduct = await Product.findByIdAndUpdate(
      product_id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).send(updatedProduct);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product_id = req.params.id;
    const deletePro = await Product.findByIdAndDelete(product_id);
    res.status(200).send(deletePro);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
