import { DataTypes } from "sequelize";
import { Table, Column, Model, BelongsTo } from "sequelize-typescript";
import { SubscriptionAttributes, SubscriptionCreationAttributes } from "../../interfaces";
import { User, Plan } from "./index";

@Table({
    timestamps: true,
    paranoid: true,
})
class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> {
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
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    planId: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    stripeSubscriptionId: string;

    @Column({
        type: DataTypes.BOOLEAN,
        allowNull: false,
    })
    autoRenew: boolean;

    @Column({
        type: DataTypes.STRING,
        allowNull: true,
    })
    status: string;

    @Column({
        type: DataTypes.DATE,
        allowNull: true,
    })
    trialEnd: Date;

    @BelongsTo(() => User, {
        foreignKey: "userId",
    })
    user: User;

    @BelongsTo(() => Plan, {
        foreignKey: "userId",
    })
    plan: Plan;
}

export default Subscription;
