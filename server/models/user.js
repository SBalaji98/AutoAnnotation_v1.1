"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      userName: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.DOUBLE, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false, unique: true },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {}
  );
  User.associate = models => {
    User.hasMany(models.Annotation, {
      as: "Annotations",
      foreignKey: "userId"
    });
  };
  return User;
};
