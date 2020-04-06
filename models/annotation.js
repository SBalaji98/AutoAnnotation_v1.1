"use strict";
module.exports = (sequelize, DataTypes) => {
  const Annotation = sequelize.define(
    "Annotation",
    {
      userId: DataTypes.UUID,
      fileName: DataTypes.STRING,
      isAnnotated: DataTypes.BOOLEAN,
      annotatedData: DataTypes.JSONB,
      isDLAnnotated: DataTypes.BOOLEAN,
      dlModelData: DataTypes.JSONB,
      isDeleted: DataTypes.BOOLEAN
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
