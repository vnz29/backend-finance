import { Router } from "express";
import userRouter from "./userRoutes.js"
import purchaseRouter from "./purchaseRoutes.js"
const router = Router()

router.use("/api/user", userRouter)
router.use("/api/purchase", purchaseRouter)

export default router