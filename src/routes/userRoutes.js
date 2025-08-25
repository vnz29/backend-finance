import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshToken,
  loginGoogle,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/signup", createUser);
router.post("/google");
router.post("/login", loginUser);
router.post("/refreshToken", refreshToken);
router.post("/logout", authenticateToken, logoutUser);
router.post("/google", loginGoogle);

export default router;
