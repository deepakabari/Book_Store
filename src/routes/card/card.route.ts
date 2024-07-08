import { Router } from "express";
import { cardController } from "../../controllers";

const router: Router = Router();

router.post("/create-checkout-session/:userId", cardController.createSession);

router.get("/success/:userId", cardController.success);

export default router;
