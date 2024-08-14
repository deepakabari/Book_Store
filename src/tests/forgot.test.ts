import request from "supertest";
import { app } from "../app";

describe("Forgot Password Controller", () => {
    const forgotPasswordUrl = "/auth/forgotPassword";

    const userEmail = "johndoe@example.com";

    // Test case: User does not exist
    it("should return 401 if user does not exist", async () => {
        const res = await request(app).post(forgotPasswordUrl).send({ email: "nonexistent@example.com" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("User not exist on this email");
    });

    // Test case: Successful password reset email sending
    it("should return 200 and send a password reset email if user exists", async () => {
        const res = await request(app).post(forgotPasswordUrl).send({ email: userEmail });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Reset email sent successfully");
    });
});
