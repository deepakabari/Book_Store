import { celebrate } from "celebrate";
import { userController } from "../../controllers";
import { Router } from "express";
import { UserSchema } from "../../validations/user.valid";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";

// Create a new router object
const router: Router = Router();

router.get("/allUsers", isAuth, wrapController(userController.getUsers));

router.get("/userById/:userId", isAuth, wrapController(userController.getUserById));

router.post("/createUser", celebrate(UserSchema.createUser), wrapController(userController.createUser));

router.patch("/user/:id", isAuth, wrapController(userController.updateUser));

router.delete("/user/:id", isAuth, wrapController(userController.deleteUser));

export default router;
