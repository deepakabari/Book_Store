import { Router } from "express";
import { orderController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";

const router: Router = Router();

router.use(isAuth);

router.post("/addOrder", wrapController(orderController.addOrder));

export default router;
