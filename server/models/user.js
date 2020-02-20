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
      is_annotated: { type: DataTypes.BOOLEAN, defaultValue: null }
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
