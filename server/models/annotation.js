"use strict";
module.exports = (sequelize, DataTypes) => {
  const Annotation = sequelize.define(
    "Annotation",
    {
      userId: DataTypes.INTEGER,
      fileName: DataTypes.STRING,
      isAnnotated: DataTypes.BOOLEAN,
      annotatedData: DataTypes.JSONB
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
