const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const Order = require("../models/order");
const { BILLPLZ_X_SIGNATURE } = require("../config");

// payment verification route
router.post("/", async (req, res) => {
  try {
    const billplz_id = req.body.billplz_id;
    const billplz_paid = req.body.billplz_paid;
    const billplz_paid_at = req.body.billplz_paid_at;
    const billplz_x_signature = req.body.billplz_x_signature;

    // verify the signature
    const billplz_string = `billplzid${billplz_id}|billplzpaid_at${billplz_paid_at}|billplzpaid${billplz_paid}`;
    const x_signature = crypto
      .createHmac("sha256", BILLPLZ_X_SIGNATURE)
      .update(billplz_string)
      .digest("hex");
    // compare signature
    if (billplz_x_signature !== x_signature) {
      res.status(400).send({ message: "Signature not valid" });
    }

    // signature is correct, then we proceed
    // find order by using the billplz_id
    const order = await Order.findOne({ billplz_id: billplz_id });

    // if order not found, return error
    if (!order) {
      res.status(400).send({ message: "Order not found" });
    }

    // if order is found, update the order status to paid
    order.status = billplz_paid === "true" ? "Paid" : "Failed";
    order.paid_at = billplz_paid_at; //when payment is made

    // save the order
    const newOrder = await order.save();

    // return the updated order
    res.status(200).send(newOrder);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
