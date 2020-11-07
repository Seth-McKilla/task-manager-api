const User = require("../models/user");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisismysupersecrettoken");
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) throw new Error();

    // Allow route handlers access to current token and user
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Please authenticate!");
  }
};

module.exports = auth;
