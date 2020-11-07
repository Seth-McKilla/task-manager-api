require("../db/mongoose");
const Task = require("../models/tasks");

// Task.findByIdAndDelete("5f8c7b8cc92120788097bc6e")
//   .then((task) => {
//     console.log(task);
//     return Task.countDocuments({ completed: false });
//   })
//   .then((count) => {
//     console.log(count);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const deleteTaskAndCount = async (id, status) => {
  const task = await Task.findByIdAndDelete(id);
  const completed = await Task.countDocuments({ status });
  return `Successfully deleted the task: ${task.description}. You have ${completed} tasks left to complete!`;
};

deleteTaskAndCount()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
