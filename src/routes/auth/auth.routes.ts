import { celebrate } from "celebrate";
import { authController } from "../../controllers";
import { Router } from "express";
import { AuthSchema } from "../../validations/index";

// Create a new router object
const router: Router = Router();

// POST /login
router.post("/login", celebrate(AuthSchema.login), authController.login);

// POST /forgotPassword
router.post("/forgotPassword", celebrate(AuthSchema.forgotPassword), authController.forgotPassword);

// POST /resetPassword/:hash
router.post("/resetPassword/:hash", celebrate(AuthSchema.resetPassword), authController.resetPassword);

export default router;
