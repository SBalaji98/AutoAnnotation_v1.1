("use strict");
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Annotations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
          as: "userId",
        },
      },
      fileName: {
        type: Sequelize.STRING,
      },
      isAnnotated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      objectDetectionData: {
        type: Sequelize.JSONB,
      },
      segmentationData: {
        type: Sequelize.JSONB,
      },
      dlAnnotatedData: {
        type: Sequelize.JSONB,
      },
      isDLAnnotated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isObjectDetected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isSegmented: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      bucketName: {
        type: Sequelize.STRING,
      },
      metadata: {
        type: Sequelize.JSONB,
      },
      isMoved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      projectId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "Projects",
          key: "id",
          as: "projectId",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Annotations");
  },
};
