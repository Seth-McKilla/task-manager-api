require("../db/mongoose");
const User = require("../models/user");

// User.findByIdAndUpdate("5f8c8f6e9b66df4cd06808c6", { age: 25 })
//   .then((user) => {
//     console.log(user);

//     return User.countDocuments({ age: 25 });
//   })
//   .then((count) => {
//     console.log(count);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const updateUserAndCountAge = async (id, age) => {
  const user = await User.findByIdAndUpdate(id, { age });
  const count = await User.countDocuments({ age });
  return `${user.name} is ${user.age} and there are ${count} other users with that same age!`;
};

updateUserAndCountAge("5f8c789a354674797ca622de", 3)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
