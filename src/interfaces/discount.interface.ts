import { Optional } from "sequelize";

// Define an interface for Discount attributes
interface DiscountAttributes {
    id: number;
    code: string;
    stripeCouponId: string;
    description?: string;
    percentage: number;
    minPrice: number;
    maxPercentage?: number | null; 
    isActive: boolean;
}

// Define a type for Discount creation attributes by making 'id' optional
type DiscountCreationAttributes = Optional<DiscountAttributes, "id">;

export { DiscountAttributes, DiscountCreationAttributes };
