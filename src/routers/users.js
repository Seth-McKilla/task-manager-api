const express = require("express");
const router = new express.Router();

const { sendWelcomeEmail, sendCancellationEmail } = require("../emails/emails");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");

// Create a new user

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Upload an avatar image

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/profile/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ height: 250, width: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Delete an avatar image

router.delete("/users/profile/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

// Serve up an avatar image

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const avatar = user.avatar;
    if (!user || !avatar) throw new Error();
    res.set("Content-Type", "image/jpg");
    res.send(avatar);
  } catch (err) {
    res.status(404).send();
  }
});

// Login an existing user

router.post("/users/login", async (req, res) => {
  try {
    // Verify user credentials based on custom built middlware function "findByCredentials"
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login to user profile

router.get("/users/profile", auth, async (req, res) => {
  res.send(req.user);
});

// Logout from a single session

router.post("/users/logout", auth, async (req, res) => {
  try {
    // Return an array of all tokens besides current token
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });

    await req.user.save();
    res.send("Successfully logged out!");
  } catch (err) {
    res.status(500).send(err);
  }
});

// Logout from all sessions

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Succesfully logged out of all sessions!");
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update user profile

router.patch("/users/profile", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) return res.status(400).send("Update is not valid!");

  try {
    // Updating bypasses middleware, therefore following code required:

    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete user profile

router.delete("/users/profile", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.status(200).send(req.user);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
