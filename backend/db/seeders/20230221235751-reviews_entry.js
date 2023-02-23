'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews'
    return queryInterface.bulkInsert(options, [
      {
        spotId: 4,
        userId: 2,
        review: 'first review',
        stars: 5
      },
      {
        spotId: 5,
        userId: 2,
        review: 'second review',
        stars: 5
      },
      {
        spotId: 3,
        userId: 3,
        review: 'third review',
        stars: 4
      },
      {
        spotId: 1,
        userId: 1,
        review: 'fourth review',
        stars: 2
      },
      {
        spotId: 2,
        userId: 2,
        review: 'fifth review',
        stars: 4
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5]}
    }, {});
  }
};
