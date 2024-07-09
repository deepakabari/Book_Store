import { Router } from "express";
import { commonController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";

const router = Router();

router.use(isAuth);

router.get("/viewFile/:fileName", wrapController(commonController.viewFile));

router.get("/downloadFile/:fileName", wrapController(commonController.downloadFile));

router.post("/download", wrapController(commonController.downloadFiles));

router.get("/exportBooks", wrapController(commonController.exportBooks));

export default router;
