import { Optional } from "sequelize";

// Define an interface for Plan attributes
interface PlanAttributes {
    id: number;
    name: string;
    price: number;
    stripePlanId: string;
    stripePriceId: string;
}

// Define a type for Plan creation attributes by making 'id' optional
type PlanCreationAttributes = Optional<PlanAttributes, "id">;

export { PlanAttributes, PlanCreationAttributes };
