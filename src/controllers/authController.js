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
  // if (!token) {
  //   return res.status(400).json({ message: "Missing credential token" });
  // }

  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log(payload);
    const { sub, email, name, picture } = payload;

    // Create your app's own JWT
    // const tokens = jwt.sign(
    //   { sub, email, name, picture },
    //   process.env.JWT_SECRET,
    //   {
    //     expiresIn: "1h",
    //   }
    // );

    res.json({ token });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Invalid Google token" });
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

// Hi, I’m Vince Lavador. I graduated from PUP Santa Rosa with a Bachelor of Science in
// Information Technology. I have three years of experience working as a software developer.
// My first job was as a Junior Front-End Developer at Seventy Door Solution Inc., where I was
// responsible for updating and maintaining the user interface and user experience of an e
// commerce website named 70doors. The technologies I used included HTML, CSS, JavaScript,
// jQuery, Bootstrap, and Git.
// For my second job, I worked as an Associate Software Engineer at OPSolutions Philippines Inc.,
// where I worked as both a React Native and web developer. I handled two mobile applications:
// Bridgestone SG Order System, which was published on the Apple App Store and Google Play
// Store, and Symphony, an internal e-commerce mobile and web application project. I was
// responsible for API integration, updating and maintaining the UI/UX of both the website and
// mobile apps, and collaborating with senior developers to implement new features. The
// technologies I used included React, React Native, Redux, React-Redux, Express, TypeScript,
// and Couchbase.
// In my most recent role as a Software Engineer, I worked on a online casino platform. My
// responsibilities included closely collaborating with UI/UX designers to implement visually
// appealing and user-friendly interfaces, participating in an on-call rotation for 24/7 support,
// integrating front-end components with back-end services (such as user accounts, transaction
// history, and real-time game data), and regularly monitoring and debugging front-end
// performance issues (e.g., broken links or game errors). The main project I worked on was an
// online casino app, and the technologies I used included React, Material UI, Bootstrap, React
// Sage, and AWS.
