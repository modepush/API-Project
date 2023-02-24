'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings'
    return queryInterface.bulkInsert(options, [
      {
        spotId: 4,
        userId: 2,
        startDate: '2023-02-15',
        endDate: '2023-03-15'
      },
      {
        spotId: 5,
        userId: 2,
        startDate: '2023-04-14',
        endDate: '2023-05-15'
      },
      {
        spotId: 3,
        userId: 3,
        startDate: '2023-06-15',
        endDate: '2023-07-15'
      },
      {
        spotId: 1,
        userId: 1,
        startDate: '2023-08-15',
        endDate: '2023-09-15'
      },
      {
        spotId: 2,
        userId: 2,
        startDate: '2023-10-15',
        endDate: '2023-11-15'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      startDate: { [Op.in]: ['2023-02-15', '2023-04-14', '2023-06-15', '2023-08-15', '2023-10-15']}
    }, {});
  }
};
