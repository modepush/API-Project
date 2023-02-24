'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.belongsTo(models.User, {foreignKey: 'ownerId'});
      Spot.hasMany(models.Booking, {foreignKey: 'spotId'});
      Spot.hasMany(models.Review, {foreignKey: 'spotId'});
      Spot.hasMany(models.SpotImage, {foreignKey: 'spotId'})
    }
  }
  Spot.init({
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        len: [1, 7]
      }
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Spot',
    scopes: {
      removeCAUA: {
        attributes: { exclude: ["createdAt", "updatedAt"] }
      },
      removeDescription: {
        attributes: { exclude: ['description'] }
      }
    }
  });
  return Spot;
};
