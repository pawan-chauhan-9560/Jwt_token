const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const { restticteToLoggedInUser, createToken } = require("./middleware/auth");
const { generateFile } = require("./generate-document");

const saltRounds = 10;
const PORT = 3001;

mongoose
  .connect("mongodb://127.0.0.1:27017/test")
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

const app = express();
app.use(express.json());
app.use(cookieParser());

const plainToHash = async (password) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (err) {
    throw new Error("Error hashing password");
  }
};
app.get("/", (req, res) => {
  return res.json({ messeage: `Comming from primary server ${process.pid}` });
});
app.get("/users", restticteToLoggedInUser(["admin"]), async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({ users });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  const { userName, email, password, role } = req.body;
  if (!userName || !email || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const hashPassword = await plainToHash(password);
    const user = new User({
      username: userName,
      email: email,
      password: hashPassword,
      role: role,
    });
    await user.save();
    res.status(201).send({ msg: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    const user = await User.findOne({ username: userName });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({ error: "Invalid password" });
    }

    const token = createToken(user);
    res.cookie("uid", token, {
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).send({ msg: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("uid", {
    sameSite: "Strict",
  });

  res.status(200).send({ msg: "Logout successful" });
});

app.post("/generate-document", async (req, res) => {
  const generatedFile = await generateFile(req);
  
  const { format } = req.body;
  if (format === "document") {
    res.setHeader("Content-Disposition", "attachment; filename=document.docx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  } else if (format === "excel") {
    res.setHeader("Content-Disposition", "attachment; filename=document.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }
  return res.send(generatedFile);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
