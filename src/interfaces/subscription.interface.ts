import { Optional } from "sequelize";

// Define an interface for Subscription attributes
interface SubscriptionAttributes {
    id: number;
    userId: number;
    planId: number;
    stripeSubscriptionId: string;
    autoRenew: boolean;
}

// Define a type for Subscription creation attributes by making 'id' optional
type SubscriptionCreationAttributes = Optional<SubscriptionAttributes, "id">;

export { SubscriptionAttributes, SubscriptionCreationAttributes };
