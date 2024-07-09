import { Router } from "express";
import { cartController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { celebrate } from "celebrate";
import { CartSchema } from "../../validations";
import { wrapController } from "../../middleware/wrapController";

const router: Router = Router();

router.post("/addCart", isAuth, celebrate(CartSchema.addCart), wrapController(cartController.addCart));

router.get("/getCart", isAuth, wrapController(cartController.getCart));

router.patch("/cart", isAuth, wrapController(cartController.updateCart));

router.delete("/cart/:cartId", isAuth, wrapController(cartController.deleteCart));

export default router;
