const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const productSchema = require("./product");

const orderSchema = new Schema({
  customerName: {
    type: String,
    required: true,
  },

  customerEmail: {
    type: String,
    required: true,
  },

  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],

  totalPrice: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Paid", "Failed", "Shipped", "Delivered"],
  },

  billplz_id: {
    type: String,
    require: true,
  },

  paid_at: {
    type: Date,
  },
});

const Order = model("Order", orderSchema);
module.exports = Order;
