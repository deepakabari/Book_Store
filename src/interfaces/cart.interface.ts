import { Optional } from "sequelize";

// Define an interface for Category attributes
interface CartAttributes {
    id: number;
    bookId: number;
    userId: number;
    quantity: number;
    isPlaced?: boolean;
    deletedAt?: Date | null;
}

// Define a type for Category creation attributes by making 'id' optional
type CartCreationAttributes = Optional<CartAttributes, "id">;

export { CartAttributes, CartCreationAttributes };
