const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../config");

const isAdminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");

    // decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // find user by _id
    const user = await User.findOne({ _id: decoded._id });

    // if user not exists
    if (!user) {
      return res.status(400).send({ message: "No user found" });
    }

    // if user exists, but not an admin
    if (user.role !== "admin") {
      return res.status(400).send({ message: "You're not an admin" });
    }

    // If user exists, pass in user data to the next function
    req.user = user;

    // if user exists, trigger the next function
    next();
  } catch (error) {
    res.status(400).send({ message: "Not Authorized" });
  }
};

module.exports = isAdminMiddleware;
