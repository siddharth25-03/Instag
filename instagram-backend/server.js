const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Load environment variables

const app = express();

// Middleware
app.use(bodyParser.json());

// Configure CORS to allow only your GitHub Pages domain
const allowedOrigins = ["https://your-github-username.github.io"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Define a User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Route to handle login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {

    // Create a new user record in the database
    const newUser = new User({ username, password: password });
    await newUser.save(); // Save the user to the database

    res.status(201).json({
      message: "User data saved successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
      },
    });
  } catch (err) {
    console.error("Error saving user data:", err); // Log the error
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
