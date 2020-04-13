("use strict");
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Annotations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
          as: "userId"
        }
      },
      fileName: {
        type: Sequelize.STRING
      },
      isAnnotated: {
        type: Sequelize.BOOLEAN,
        defaultValue: null
      },
      annotatedData: {
        type: Sequelize.JSONB
      },
      dlAnnotatedData: {
        type: Sequelize.JSONB
      },
      isDLAnnotated: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isObjectDetected: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isSegmented: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      bucketName: {
        type: Sequelize.STRING
      },
      metadata: {
        type: Sequelize.JSONB
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Annotations");
  }
};
