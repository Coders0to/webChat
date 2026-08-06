import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("App is running successfully 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
