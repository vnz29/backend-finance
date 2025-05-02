import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

export const createUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Create a new user instance
    const newUser = new User({
      username,
      password,
    });

    // Save the user to the database
    const user = await newUser.save();
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie("sessionID", token);
    // Send response
    res
      .status(201)
      .json({ message: "User created successfully", blog: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log("test");
  console.log(process.env.REFRESH_TOKEN_SECRET);
  console.log(process.env.ACCESS_TOKEN_SECRET);
  console.log(username, password);
  try {
    if (!username || !password) {
      return res.status(400).json({ errorMessage: "input all fields" });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser)
      return res
        .status(401)
        .json({ errorMessage: "Incorrect Email or Password" });

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!passwordCorrect)
      return res
        .status(401)
        .json({ errorMessage: "Incorrect Email or Password" });

    //sign token
    const { accessToken, refreshToken } = generateTokens(existingUser);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      username: existingUser.username,
      message: "Successfully log in",
      accessToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  console.log(token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  });
};

// LOGOUT
export const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.sendStatus(204);
};
