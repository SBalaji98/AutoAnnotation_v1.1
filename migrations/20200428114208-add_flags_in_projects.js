"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Projects", "isRequiredSegmentations", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.addColumn("Projects", "isRequiredObjDetections", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Projects", "isRequiredSegmentations"),
      queryInterface.removeColumn("Projects", "isRequiredObjDetections"),
    ]);
  },
};
