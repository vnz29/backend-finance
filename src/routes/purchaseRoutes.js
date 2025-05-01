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
router.get("/search", getSpecificPurchase);
router.post("/addPurchase", addPurchase);
router.put("/updatePurchase", updatePurchase);
router.delete("/updatePurchase", deletePurchase);

export default router;
