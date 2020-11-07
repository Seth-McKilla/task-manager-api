const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("./task");

// New Schema required for customizing middleware (see below)

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email address is not valid!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password"))
          throw new Error("Password cannot contain the word password!");
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number!");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

// Create a "virtual" owner id on the task model
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// Method to send back only public data for the profile
userSchema.methods.toJSON = function () {
  // "this" represents the user object, so declaration for sake of clarity
  const user = this;

  // Convert user JSON into object in order to manipulate variables
  const userObject = user.toObject();

  // Remove password and tokens before sending the object back to the user
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  // Send the revised user object back to the user
  return userObject;
};

// Assign a jwt to a user that has already been created
// Methods are used on objects that have already been instantiated

userSchema.methods.generateAuthToken = async function () {
  // "this" represents the user object, so declaration for sake of clarity
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  // Add the newly created token to the end of the existing tokens array
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Custom middleware function for verifying user credentials
// The statics object are functions that are associated with the model itself

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Unable to login!");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Unable to login!");
  return user;
};

// Middleware to hash password before saving (pre method)
userSchema.pre("save", async function (next) {
  // "this" represents the user object, so declaration for sake of clarity
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  // "next" tells mongoose to continue executing code
  next();
});

// Middleware to remove all tasks of a deleted user (pre method)
userSchema.pre("remove", async function (next) {
  // "this" represents the user obect, so declaration for the sake of clarity
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
