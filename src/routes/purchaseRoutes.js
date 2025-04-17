import express from 'express';
import { addPurchase, deletePurchase, getCurrentPurchase, getSpecificPurchase, updatePurchase } from '../controllers/purchaseController.js';



const router = express.Router();
router.get("/", getCurrentPurchase)
router.get("/search", getSpecificPurchase)
router.post("/addPurchase", addPurchase)
router.put("/updatePurchase", updatePurchase)
router.delete("/updatePurchase", deletePurchase)



export default router 