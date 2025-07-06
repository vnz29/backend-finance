import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // ✅ required for SameSite=None
      sameSite: "Strict",

      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      id: user.id,
      username: user.username,
      message: "Successfully log in",
      accessToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ errorMessage: "input all fields" });
    }

    const existingUser = await User.findOne({ username });
    if (!existingUser)
      return res.status(401).json({ message: "Incorrect Email or Password" });
    console.log(existingUser);
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
      secure: true, // ✅ required for SameSite=None
      sameSite: "Strict",

      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      id: existingUser.id,
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

  // console.log(token);
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

//login using google
export const loginGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, email_verified } = payload;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const { accessToken, refreshToken } = generateTokens(existingUser);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // ✅ required for SameSite=None
        sameSite: "Strict",

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(200).json({
        id: existingUser.id,
        username: existingUser.username,
        message: "Successfully log in",
        accessToken,
      });
    } else {
      const newUser = new User({
        username: name,
        email: email,
        emailVerified: email_verified,
        isGoogleLoggedIn: true,
      });
      const user = await newUser.save();
      const { accessToken, refreshToken } = generateTokens(user);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true, // ✅ required for SameSite=None
        sameSite: "Strict",

        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.status(201).json({
        id: user.id,
        username: user.username,
        message: "User created successfully and Log in",
        accessToken,
      });
    }
  } catch (err) {
    //  console.error("Error creating or finding Google user:", error);
    // throw new Error("Something went wrong with user creation or lookup.");
    console.log(err);
    res.status(500).send();
  }

  // try {
  //   if (!username || !password) {
  //     return res.status(400).json({ errorMessage: "input all fields" });
  //   }

  //   const existingUser = await User.findOne({ username });
  //   if (!existingUser)
  //     return res
  //       .status(401)
  //       .json({ errorMessage: "Incorrect Email or Password" });

  //   const passwordCorrect = await bcrypt.compare(
  //     password,
  //     existingUser.password
  //   );

  //   if (!passwordCorrect)
  //     return res
  //       .status(401)
  //       .json({ errorMessage: "Incorrect Email or Password" });

  //   //sign token
  //   const { accessToken, refreshToken } = generateTokens(existingUser);
  //   res.cookie("refreshToken", refreshToken, {
  //     httpOnly: true,
  //     secure: true, // ✅ required for SameSite=None
  //     sameSite: "Strict",

  //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  //   });

  //   res.status(200).json({
  //     id: existingUser.id,
  //     username: existingUser.username,
  //     message: "Successfully log in",
  //     accessToken,
  //   });
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).send();
  // }
};
