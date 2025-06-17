import express from "express";
import {
  addPurchase,
  deletePurchase,
  getCurrentPurchase,
  getSpecificPurchase,
  updatePurchase,
} from "../controllers/purchaseController.js";
import {
  authenticateToken,
  requireAuth,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
router.get("/", authenticateToken, getCurrentPurchase);
router.get("/search", authenticateToken, getSpecificPurchase);
router.post("/addPurchase", authenticateToken, addPurchase);
router.put("/updatePurchase/:id", authenticateToken, updatePurchase);
router.patch("/deletePurchase/:id", authenticateToken, deletePurchase);

export default router;
