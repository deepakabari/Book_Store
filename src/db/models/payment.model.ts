import { DataTypes } from "sequelize";
import { Table, Column, Model, BelongsTo } from "sequelize-typescript";
import { PaymentAttributes, PaymentCreationAttributes } from "../../interfaces";
import { User } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    userId: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0,
    })
    paymentMethodId?: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    stripeCustomerId?: string;

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;
}

export default Payment;
