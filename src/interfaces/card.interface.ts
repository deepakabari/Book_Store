import { Optional } from "sequelize";

// Define an interface for Category attributes
interface CardAttributes {
    id: number;
    userId: number;
    cardId?: string;
    cardBrand?: string;
    cardHolderName?: string;
    cardNumber?: string;
    cardLastFour?: string;
    tokenId?: string;
    expMonth: number;
    expYear: number;
}

// Define a type for Category creation attributes by making 'id' optional
type CardCreationAttributes = Optional<CardAttributes, "id">;

export { CardAttributes, CardCreationAttributes };
