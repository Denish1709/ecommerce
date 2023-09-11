const express = require("express");
const router = express.Router();

const Order = require("../models/order");

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }
    res.status(200).send(await Order.find(filter).populate("products"));
  } catch (error) {
    res.status(400).send({ message: "Order not found" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await Order.findOne({ _id: req.params.id });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send({ message: "Order not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newOrder = new Order({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      products: req.body.products,
      totalPrice: req.body.totalPrice,
      status: req.body.status,
    });

    await newOrder.save();
    res.status(200).send(newOrder);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    const updatedOrder = await Order.findByIdAndUpdate(order_id, req.body, {
      new: true,
    });
    res.status(200).send(updatedOrder);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const order_id = req.params.id;

    const deleteOrder = await Order.findByIdAndDelete(order_id);
    res.status(200).send(deleteOrder);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
