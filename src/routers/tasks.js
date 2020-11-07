const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

// Create a new task

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Read all tasks
// GET /tasks?completed=____
// GET /tasks?limit=__&skip=__
// GET /tasks?sortBy=createdAt:desc-or-asc

router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    // Only return tasks of the current owner
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          // Pagination for limiting results and page navigation
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Read task by id

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    // Only find a task if it is owned by current user
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();

    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update task by id

router.patch("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["completed", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) return res.status(400).send("Update is not valid!");

  try {
    // Updating bypasses middleware, therefore following code required:

    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) return res.status(404).send("No task found!");
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete task by id

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) return res.status(404).send("No task found!");
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
