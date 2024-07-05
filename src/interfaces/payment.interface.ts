import { Optional } from "sequelize";

// Define an interface for Category attributes
interface PaymentAttributes {
    id: number;
    userId: number;
    paymentMethodId?: string;
    stripeCustomerId?: string;
}

// Define a type for Category creation attributes by making 'id' optional
type PaymentCreationAttributes = Optional<PaymentAttributes, "id">;

export { PaymentAttributes, PaymentCreationAttributes };
