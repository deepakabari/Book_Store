import { celebrate } from "celebrate";
import { userController } from "../../controllers";
import { Router } from "express";
import { UserSchema } from "../../validations/user.valid";
import isAuth from "../../middleware/in-auth";

// Create a new router object
const router: Router = Router();

// POST /login
router.post("/createUser", celebrate(UserSchema.createUser), userController.createUser);

router.patch("/user/:id", isAuth, userController.updateUser);

router.delete("/user/:id", isAuth, userController.deleteUser);

export default router;
