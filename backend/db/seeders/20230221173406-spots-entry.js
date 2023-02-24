'use strict';

/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        address: '123 Casper Ave',
        city: 'Irvine',
        state: 'California',
        country: 'United States of America',
        lat: 32.1456733,
        lng: 90.5112377,
        name: 'Newplace1',
        description: 'the first place created',
        price: 150,
        ownerId: 1
      },
      {
        address: '35 Sky Cir',
        city: 'Irvine',
        state: 'California',
        country: 'United States of America',
        lat: 55.8921157,
        lng: 18.9261658,
        name: 'Newplace2',
        description: 'the second place created',
        price: 285,
        ownerId: 2
      },
      {
        address: '90 Railroad Park',
        city: 'Irvine',
        state: 'California',
        country: 'United States of America',
        lat: 7.2145357,
        lng: 87.4415854,
        name: 'Newplace3',
        description: 'the third place created',
        price: 950,
        ownerId: 3
      },
      {
        address: '33 Abu Dhabi',
        city: 'Irvine',
        state: 'California',
        country: 'United States of America',
        lat: 33.4444674,
        lng: 15.1666445,
        name: 'Squashing LH44',
        description: 'the fourth place created',
        price: 1000,
        ownerId: 2
      },
      {
        address: '1 Suzuka Circuit',
        city: 'Irvine',
        state: 'California',
        country: 'United States of America',
        lat: 52.5166247,
        lng: -83.2166785,
        name: 'Rain Champ',
        description: 'the fifth place created',
        price: 1000,
        ownerId: 2
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Newplace1', 'Newplace2', 'Newplace3', 'Squashing LH44', 'Rain Champ']}
    }, {});
  }
};
