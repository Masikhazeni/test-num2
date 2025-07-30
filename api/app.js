const express = require("express");
const eventRouter = require("./routes/eventRoutes");

const app = express();
app.use(express.json());

app.use("/api/events", eventRouter);

app.use("any thing else", (req, res) => {
  res.status(404).json({ error: "آدرس مورد نظر یافت نشد" });
});

module.exports = app;
