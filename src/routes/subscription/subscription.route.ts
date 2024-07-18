import { billingController, SubscriptionController, testClocKController } from "../../controllers";
import { Router } from "express";
import isAuth from "../../middleware/in-auth";
import { wrapController } from "../../middleware/wrapController";

// Create a new router object
const router: Router = Router();

router.use(isAuth);

router.get("/retrievePlan/:planId", wrapController(SubscriptionController.retrievePlan));

router.post("/createPlan", wrapController(SubscriptionController.createPlan));

router.post("/create", wrapController(SubscriptionController.createSubscription));

router.get("/retrieveSubscription/:userId", wrapController(SubscriptionController.retrieveSubscription));

router.patch("/auto-renew", wrapController(SubscriptionController.cancelSubscription));

router.post("/resumeSubscription", wrapController(SubscriptionController.resumeSubscription));

router.post("/createTestClock", wrapController(testClocKController.CreateTestClock));

router.post("/advanceTestClock", wrapController(testClocKController.advanceTestClock));

router.post("/billing/:userId", wrapController(billingController.createBillingSession));

router.post("/checkoutSub", wrapController(billingController.checkoutSub));

router.post("/cancelSub", wrapController(SubscriptionController.cancelDirect));

export default router;
