import { Optional } from "sequelize";

// Define an interface for Category attributes
interface CategoryAttributes {
    id: number;
    name: string;
}

// Define a type for Category creation attributes by making 'id' optional
type CategoryCreationAttributes = Optional<CategoryAttributes, "id">;

export { CategoryAttributes, CategoryCreationAttributes };
