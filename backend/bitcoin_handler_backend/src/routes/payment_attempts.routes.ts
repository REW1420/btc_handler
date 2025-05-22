import { Router } from "express";
import { create_lightning_payment_attempt } from "../controllers/payment_attempts.controller";

const router = Router();

router.post("/", create_lightning_payment_attempt);

export default router;
