'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 4,
        url: 'first url',
        preview: true
      },
      {
        spotId: 1,
        url: 'second url',
        preview: false
      },
      {
        spotId: 5,
        url: 'third url',
        preview: true
      },
      {
        spotId: 2,
        url: 'fourth url',
        preview: false
      },
      {
        spotId: 3,
        url: 'fifth url',
        preview: true
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5]}
    }, {});
  }
};
