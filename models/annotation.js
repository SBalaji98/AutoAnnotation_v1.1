"use strict";
module.exports = (sequelize, DataTypes) => {
  const Annotation = sequelize.define(
    "Annotation",
    {
      userId: { type: DataTypes.UUID, allowNull: false },
      fileName: DataTypes.STRING,
      isAnnotated: { type: DataTypes.BOOLEAN, defaultValue: false },
      objectDetectionData: DataTypes.JSONB,
      segmentationData: DataTypes.JSONB,
      isDLAnnotated: { type: DataTypes.BOOLEAN, defaultValue: false },
      dlAnnotatedData: DataTypes.JSONB,
      isObjectDetected: { type: DataTypes.BOOLEAN, defaultValue: false },
      isSegmented: { type: DataTypes.BOOLEAN, defaultValue: false },
      bucketName: DataTypes.STRING,
      metadata: DataTypes.JSONB,
      isMoved: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {}
  );
  Annotation.associate = function(models) {
    Annotation.belongsTo(models.User, {
      as: "user",
      foreignkey: "userId",
      onDelete: "CASCADE"
    });
  };
  return Annotation;
};
