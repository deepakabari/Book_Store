import { Router } from "express";
import { discountController } from "../../controllers";
import { wrapController } from "../../middleware/wrapController";

const router = Router();

router.post("/create", wrapController(discountController.createDiscount));

export default router;
