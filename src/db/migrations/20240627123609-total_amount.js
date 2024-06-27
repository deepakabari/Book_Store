"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Order", "totalAmount", {
            type: Sequelize.INTEGER,
            allowNull: true,
            after: "cartId",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Order", "totalAmount");
    },
};
