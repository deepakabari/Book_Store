import { Optional } from 'sequelize';

// Define an interface for User attributes
interface UserAttributes {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: string;
    phoneNumber: string;
    roleId: number;
    role: string;
    resetToken?: string | null;
    expireToken?: Date | null;
}

// Define a type for User creation attributes by making 'id' optional
type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export { UserAttributes, UserCreationAttributes };
