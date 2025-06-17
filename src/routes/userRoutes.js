import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshToken,
  loginGoogle,
} from "../controllers/authController.js";

const router = express.Router();
router.post("/signup", createUser);
router.post("/google");
router.post("/login", loginUser);
router.post("/refreshToken", refreshToken);
router.post("/logout", logoutUser);
router.post("/google", loginGoogle);

export default router;
