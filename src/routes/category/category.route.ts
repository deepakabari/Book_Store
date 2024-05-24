import { Router } from "express";
import { categoryController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { celebrate } from "celebrate";
import { CategorySchema } from "../../validations/category.valid";

const router: Router = Router();

router.use(isAuth);

router.get("/getCategories", categoryController.getCategories);

router.post("/createCategory", celebrate(CategorySchema.createCategory), categoryController.createCategory);

router.patch("/updateCategory/:id", celebrate(CategorySchema.createCategory), categoryController.updateCategory);

router.delete("/deleteCategory/:id", categoryController.deleteCategory);

export default router;
