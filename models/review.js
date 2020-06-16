"use strict";
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      userId: { type: DataTypes.UUID, allowNull: false },
      fileName: DataTypes.STRING,
      isAnnotated: { type: DataTypes.BOOLEAN, defaultValue: false },
      objectDetectionData: DataTypes.JSONB,
      segmentationData: DataTypes.JSONB,
      isObjectDetected: { type: DataTypes.BOOLEAN, defaultValue: false },
      isSegmented: { type: DataTypes.BOOLEAN, defaultValue: false },
      bucketName: DataTypes.STRING,
      metadata: DataTypes.JSONB,
      isMoved: { type: DataTypes.BOOLEAN, defaultValue: false },
      projectId: { type: DataTypes.INTEGER },
    },
    {}
  );
  Review.associate = function (models) {
    Review.belongsTo(models.User, {
      as: "user",
      foreignkey: "userId",
      onDelete: "CASCADE",
    });

    Review.belongsTo(models.Projects, {
      as: "project",
      foreignkey: "projectId",
      onDelete: "CASCADE",
    });
  };
  return Review;
};
