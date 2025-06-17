import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshToken,
} from "../controllers/authController.js";

const router = express.Router();
router.post("/signup", createUser);
router.post("/google");
router.post("/login", loginUser);
router.post("/refreshToken", refreshToken);
router.post("/logout", logoutUser);

export default router;
