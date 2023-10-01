const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyparser = require("body-parser");

const app = express();
dotenv.config();

//middleware
app.use(cors());
app.use(express.json());

//connections
mongoose
  .connect(
    `mongodb+srv://adminopin:${process.env.MONGODB_PASSWORD}@cluster0.uajttgh.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() =>
    app.listen(5000, () => console.log("server running on port 5000"))
  )
  .catch((err) => console.log(err));

//define the schema and model for the error code lookup tool
const errorCodeSchema = new mongoose.Schema({
  errorCode: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true,
  },
});

const ErrorCode = mongoose.model("ErrorCode", errorCodeSchema);

// API routes
app.post("/api/error-codes", async (req, res) => {
  try {
    const { errorCode, description, solution } = req.body;
    const newErrorCode = new ErrorCode({ errorCode, description, solution });
    await newErrorCode.save();
    res.json(newErrorCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/error-codes/:id", async (req, res) => {
  try {
    const errorCode = await ErrorCode.findById(req.params.id);
    if (!errorCode) {
      return res.status(404).json({ message: "Error code not found" });
    }
    res.json(errorCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/error-codes/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const errorCodes = await ErrorCode.find({
      $or: [
        { errorCode: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { solution: { $regex: query, $options: "i" } },
      ],
    });

    if (errorCodes.length === 0) {
      return res.status(404).json({ message: "No matching error codes found" });
    }

    res.json(errorCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
