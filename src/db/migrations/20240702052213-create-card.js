"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Card", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            cardId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cardBrand: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            cardLastFour: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tokenId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            expMonth: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            expYear: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable("Card");
    },
};
