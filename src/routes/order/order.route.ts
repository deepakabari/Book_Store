import { Router } from "express";
import { orderController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { celebrate } from "celebrate";
import { OrderSchema } from "../../validations";

const router: Router = Router();

router.use(isAuth);

router.post("/addOrder", isAuth, celebrate(OrderSchema.add), orderController.addOrder);

export default router;
