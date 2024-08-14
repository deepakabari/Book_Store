import request from "supertest";
import { app } from "../app";

describe("Login Controller", () => {
    const loginUrl = "/auth/login";

    it("should return 401 if user does not exist", async () => {
        const res = await request(app)
            .post(loginUrl)
            .send({ email: "nonexistent@example.com", password: "password123" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("User not exist on this email");
    });

    it("should return 401 if password does not match", async () => {
        const res = await request(app).post(loginUrl).send({ email: "test@stripe.com", password: "wrongpassword" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Wrong password");
    });

    it("should return 200 and a token if login is successful", async () => {
        const res = await request(app).post(loginUrl).send({ email: "test@stripe.com", password: "Password@123" });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("data");
        let token = res.body.data;
        expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);
    });
});
