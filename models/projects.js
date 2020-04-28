"use strict";
module.exports = (sequelize, DataTypes) => {
  const Projects = sequelize.define(
    "Projects",
    {
      projectName: DataTypes.STRING,
      targetObjDetection: DataTypes.INTEGER,
      targetSegmentations: DataTypes.INTEGER,
    },
    {}
  );
  Projects.associate = function (models) {
    Projects.hasMany(models.Annotation, {
      as: "Annotations",
      foreignKey: "projectId",
    });
  };
  return Projects;
};
