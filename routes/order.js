const express = require("express");
const axios = require("axios");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Order = require("../models/order");
const User = require("../models/user");

const {
  BILLPLZ_API_URL,
  BILLPLZ_API_KEY,
  BILLPLZ_COLLECTION_ID,
  JWT_SECRET,
} = require("../config");

const authMiddleware = require("../middleware/auth");
const isAdminMiddleware = require("../middleware/isAdmin");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    const { status } = req.query;
    let filter = {};

    // decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // find user by _id
    const user = await User.findOne({ _id: decoded._id });

    if (status) {
      filter.status = status;
    }

    // only user will have this filter
    if (user && user.role === "user") {
      filter.customerEmail = user.email;
    }

    res
      .status(200)
      .send(await Order.find(filter).populate("products").sort({ _id: -1 }));
  } catch (error) {
    res.status(400).send({ message: "Order not found" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const data = await Order.findOne({ _id: req.params.id });
    res.status(200).send(data);
  } catch (error) {
    res.status(400).send({ message: "Order not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    // call the billplz API to create a bill
    const billplz = await axios({
      method: "POST",
      url: BILLPLZ_API_URL + "v3/bills",
      auth: {
        username: BILLPLZ_API_KEY,
        password: "",
      },
      data: {
        collection_id: BILLPLZ_COLLECTION_ID,
        email: req.body.customerEmail,
        name: req.body.customerName,
        amount: parseFloat(req.body.totalPrice) * 100,
        description: req.body.description,
        callback_url: "http://localhost:3000/verify-payment",
        redirect_url: "http://localhost:3000/verify-payment",
      },
    });
    // create order in database
    const newOrder = new Order({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      products: req.body.products,
      totalPrice: req.body.totalPrice,
      billplz_id: billplz.data.id, // store the billplz ID in our order
    });

    await newOrder.save();

    // return the billplz data
    res.status(200).send(billplz.data);
  } catch (error) {
    res.status(400).send({
      message: error._message
        ? error._message
        : error.response.data.error.message[0],
    });
  }
});

router.put("/:id", isAdminMiddleware, async (req, res) => {
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

router.delete("/:id", isAdminMiddleware, async (req, res) => {
  try {
    const order_id = req.params.id;

    const deleteOrder = await Order.findByIdAndDelete(order_id);
    res.status(200).send(deleteOrder);
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
