"use strict";
module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define(
    "Roles",
    {
      role: { type: DataTypes.STRING },
    },
    {}
  );
  Roles.associate = function (models) {
    Roles.hasMany(models.User, {
      as: "Users",
      foreignKey: "roleId",
    });
  };

  return Roles;
};
