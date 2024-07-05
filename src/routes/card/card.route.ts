import { Router } from "express";
import { cardController } from "../../controllers";
import isAuth from "../../middleware/in-auth";

const router: Router = Router();

router.use(isAuth);

router.post("/create-checkout-session/:userId", cardController.createSession);

router.get("/success/:userId", cardController.success);

export default router;
