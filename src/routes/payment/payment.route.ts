import { Router } from "express";
import { paymentController } from "../../controllers";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";

const router: Router = Router();

router.use(isAuth);

router.post("/createCustomer/:userId", wrapController(paymentController.createCustomer));

router.get("/payment-form/:email", wrapController(paymentController.openPaymentForm));

router.post("/sendPaymentLink", wrapController(paymentController.sendPaymentLink));

router.post("/addCardHolder/:userId", wrapController(paymentController.addCardHolder));

router.post("/addCard/:userId", wrapController(paymentController.addCard));

router.post("/createPaymentMethod/:email", wrapController(paymentController.createPaymentMethod));

router.post("/authorize/:userId", wrapController(paymentController.authorization));

router.post("/capture/:authId", wrapController(paymentController.capture));

export default router;
