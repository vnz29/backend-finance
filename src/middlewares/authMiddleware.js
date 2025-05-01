import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const requireAuth = (req, res, next) => {
  const token = req.cookies.sessionID;
  console.log(token);
  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        res.status(401).send({ errorMessage: "unauthorized" });
      } else {
        console.log(decodedToken);

        next();
      }
    });
  } else {
    res.status(401).send({ errorMessage: "unauthorized" });
  }
};

export const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedToken) => {
        if (err) {
          res.locals.user = null;
          next();
        } else {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
          next();
        }
      }
    );
  } else {
    res.locals.user = null;
    next();
  }
};
