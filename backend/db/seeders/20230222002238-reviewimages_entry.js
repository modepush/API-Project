'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkInsert(options, [
      {
        reviewId: 1,
        url: 'url1'
      },
      {
        reviewId: 2,
        url: 'url2'
      },
      {
        reviewId: 3,
        url: 'url3'
      },
      {
        reviewId: 4,
        url: 'url4'
      },
      {
        reviewId: 5,
        url: 'url5'
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4, 5]}
    }, {});
  }
};
