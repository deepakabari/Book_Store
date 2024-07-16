import { DataTypes } from "sequelize";
import { Table, Column, Model } from "sequelize-typescript";
import { PlanAttributes, PlanCreationAttributes } from "../../interfaces";

@Table({
    timestamps: true,
    paranoid: true,
})
class Plan extends Model<PlanAttributes, PlanCreationAttributes> {
    @Column({
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    })
    name: string;

    @Column({
        type: DataTypes.INTEGER,
        allowNull: false,
    })
    price: number;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    stripePlanId: string;

    @Column({
        type: DataTypes.STRING,
        allowNull: false,
    })
    stripePriceId: string;
}

export default Plan;
