import { Router } from "express";
import { categoryController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { celebrate } from "celebrate";
import { CategorySchema } from "../../validations/category.valid";
import { wrapController } from "../../middleware/wrapController";

const router: Router = Router();

router.use(isAuth);

router.get("/getCategories", wrapController(categoryController.getCategories));

router.get("/categoryById/:categoryId", wrapController(categoryController.categoryById));

router.post(
    "/createCategory",
    celebrate(CategorySchema.createCategory),
    wrapController(categoryController.createCategory),
);

router.patch(
    "/category/:id",
    celebrate(CategorySchema.createCategory),
    wrapController(categoryController.updateCategory),
);

router.delete("/category/:id", wrapController(categoryController.deleteCategory));

export default router;
