import { Router } from "express";
import { cartController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { celebrate } from "celebrate";
import { CartSchema } from "../../validations";

const router: Router = Router();

router.post("/addCart", isAuth, celebrate(CartSchema.addCart), cartController.addCart);

router.get("/getCart", isAuth, cartController.getCart);

router.patch("/cart", isAuth, cartController.updateCart);

router.delete("/cart/:cartId", isAuth, cartController.deleteCart);

export default router;
