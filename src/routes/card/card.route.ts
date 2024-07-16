import { Router } from "express";
import { cardController } from "../../controllers";
import { wrapController } from "../../middleware/wrapController";

const router: Router = Router();

router.post("/create-checkout-session/:userId", wrapController(cardController.createSession));

router.get("/success/:userId", wrapController(cardController.success));

router.post("/createUserCard", wrapController(cardController.addUserCard));

export default router;
