import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const requireAuth = (req, res, next) => {
  const token = req.cookies.sessionID;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).send({ errorMessage: "unauthorized" });
      } else {
        next();
      }
    });
  } else {
    console.log("pasok dito");
    res.status(401).send({ errorMessage: "unauthorized" });
  }
};
