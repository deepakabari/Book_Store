import { Optional } from "sequelize";

// Define an interface for TaxRate attributes
interface TaxRateAttributes {
    id: number;
    stripeTaxRateId: string;
    displayName: string;
    description?: string;
    jurisdiction: string;
    percentage: number;
    inclusive: boolean;
}

// Define a type for TaxRate creation attributes by making 'id' optional
type TaxRateCreationAttributes = Optional<TaxRateAttributes, "id">;

export { TaxRateAttributes, TaxRateCreationAttributes };
