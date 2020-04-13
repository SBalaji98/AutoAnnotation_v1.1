"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      userName: { type: DataTypes.STRING, allowNull: false, unique: true },
      phone: { type: DataTypes.DOUBLE, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false, unique: true },
      isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      resetPasswordToken: { type: DataTypes.STRING },
      resetPasswordTokenExpires: { type: DataTypes.DATE }
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
