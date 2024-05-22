import { celebrate } from "celebrate";
import { userController } from "../../controllers";
import { Router } from "express";
import { UserSchema } from "../../validations/user.valid";
import isAuth from "../../middleware/in-auth";

// Create a new router object
const router: Router = Router();

// POST /login
router.post("/createUser", celebrate(UserSchema.createUser), userController.createUser);

router.patch("/updateUser/:id", isAuth, userController.updateUser);

router.delete("/deleteUser/:id", isAuth, userController.deleteUser);

export default router;
