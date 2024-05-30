import { Optional } from "sequelize";

// Define an interface for Category attributes
interface OrderAttributes {
    id: number;
    userId: number;
    cartId: number;
}

// Define a type for Category creation attributes by making 'id' optional
type OrderCreationAttributes = Optional<OrderAttributes, "id">;

export { OrderAttributes, OrderCreationAttributes };
