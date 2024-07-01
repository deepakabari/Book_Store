import { Optional } from "sequelize";

// Define an interface for Book attributes
interface BookAttributes {
    id: number;
    userId: number;
    name: string;
    image: string;
    description: string;
    price: number;
    categoryId: number;
    quantity: number;
}

// Define a type for Book creation attributes by making 'id' optional
type BookCreationAttributes = Optional<BookAttributes, "id">;

export { BookAttributes, BookCreationAttributes };
