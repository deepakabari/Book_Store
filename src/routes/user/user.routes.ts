import { celebrate } from "celebrate";
import { userController } from "../../controllers";
import { Router } from "express";
import { UserSchema } from "../../validations/user.valid";

// Create a new router object
const router: Router = Router();

// POST /login
router.post("/createUser", celebrate(UserSchema.createUser), userController.createUser);

export default router;
