const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { isEmail } = require("../utilities/functions");
const { JWT_SECRET } = require("../config");

router.post("/register", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = bcrypt.hashSync(req.body.password, 10);

    // check if email is valid or not
    if (!isEmail(email)) {
      return res.status(400).send({ message: "Email is invalid" });
    }

    // check if email already exists or not
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(400).send({ message: "Email already exists" });
    }

    // create new user data
    const user = new User({
      name: name,
      email: email,
      password: password,
    });

    // save the data
    const newUser = await user.save();

    // generate JSON web token
    const token = jwt.sign({ _id: newUser._id }, JWT_SECRET);

    // return back the data
    res.status(200).send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: token,
    });
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // check email if the user exists or not
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    // check if password is match or not
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    // generate JSON web token
    const token = jwt.sign({ _id: user._id }, JWT_SECRET);

    // return back the data
    res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (error) {
    res.status(400).send({ message: error._message });
  }
});

module.exports = router;
