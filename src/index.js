const express = require("express");
require("./db/mongoose");
const usersRouter = require("./routers/users");
const tasksRouter = require("./routers/tasks");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(usersRouter);
app.use(tasksRouter);

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}!`);
});
