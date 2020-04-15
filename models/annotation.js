"use strict";
module.exports = (sequelize, DataTypes) => {
  const Annotation = sequelize.define(
    "Annotation",
    {
      userId: DataTypes.UUID,
      fileName: DataTypes.STRING,
      isAnnotated: DataTypes.BOOLEAN,
      objectDetectionData: DataTypes.JSONB,
      segmentationData: DataTypes.JSONB,
      isDLAnnotated: DataTypes.BOOLEAN,
      dlAnnotatedData: DataTypes.JSONB,
      isObjectDetected: DataTypes.BOOLEAN,
      isSegmented: DataTypes.BOOLEAN,
      bucketName: DataTypes.STRING,
      metadata: DataTypes.JSONB,
      isMoved: DataTypes.BOOLEAN
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
