"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Plan", "trialEligible", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            after: "stripePriceId"
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Plan", "trialEligible");
    },
};
