const express = require('express');
const router = express.Router();
const {Spot, User, SpotImage, Review, sequelize} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');


router.get('/current', requireAuth, async (req, res) => {
    const {user} = req

    const getSpots = await Spot.findAll({
        where: {
            ownerId: user.id
        },
        include: {model: Review}
    });

    const payload = [];

    for (let i = 0; i < getSpots.length; i++) {
        const spot = getSpots[i];

        const getReviews = await spot.getReviews({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating'],
                ['spotId', 'newspot']
            ],
            group: ['id']
        });

        const url = await SpotImage.findAll({
            where: {
                preview: true
            },
            include: {model: Spot}
        })
        const newObj = {
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
            avgRating: null,
            previewImage: null
        }
        for (let urlVal of url) {
            if (urlVal.spotId === newObj.id) {
                newObj.previewImage = urlVal.url
            }
        }
        for (let ele of getReviews) {
            const obj = ele.dataValues
            if (obj.newspot === newObj.id) {
                newObj.avgRating = obj.avgRating
            }
        }
        payload.push(newObj)
    }


        return res.status(200).json({Spots:payload})

});

router.get('/:spotId', async (req, res) => {
    const spots = await Spot.findByPk(req.params.spotId, {
        include: {model: User}
    });

    const counter = await spots.getReviews({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'numReviews'],
            [sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating'],
            ['spotId', 'newspot']
        ],
        group: ['id']
    });

    const url = await SpotImage.findByPk(req.params.spotId, {
        attributes: {
            exclude: ['spotId', 'createdAt', 'updatedAt']
        }
    });

    if (spots) {
        const newObj = {
            id: spots.id,
            ownerId: spots.ownerId,
            address: spots.address,
            city: spots.city,
            state: spots.state,
            country: spots.country,
            lat: spots.lat,
            lng: spots.lng,
            name: spots.name,
            description: spots.description,
            price: spots.price,
            createdAt: spots.createdAt,
            updatedAt: spots.updatedAt,
            numReviews: null,
            avgStarRating: null,
            SpotImages: [url],
            Owner: spots.User.dataValues
        }
        for (let ele of counter) {
            const obj = ele.dataValues
            if (obj.newspot === newObj.id) {
                newObj.avgStarRating = obj.avgStarRating
                newObj.numReviews = obj.numReviews
            }
        }
        return res.status(200).json(newObj)
    } else {
        res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }
});

router.get('/', async (req, res) => {

const getSpots = await Spot.findAll({
    include: {model: Review},
});

const payload = [];

for (let i = 0; i < getSpots.length; i++) {
    const spot = getSpots[i];

    const getReviews = await spot.getReviews({
        attributes: [
            [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating'],
            ['spotId', 'newspot']
        ],
        group: ['id']
    });

    const url = await SpotImage.findAll({
        where: {
            preview: true
        },
        include: {model: Spot}
    })
    const newObj = {
        id: spot.id,
        ownerId: spot.ownerId,
        address: spot.address,
        city: spot.city,
        state: spot.state,
        country: spot.country,
        lat: spot.lat,
        lng: spot.lng,
        name: spot.name,
        description: spot.description,
        price: spot.price,
        createdAt: spot.createdAt,
        updatedAt: spot.updatedAt,
        avgRating: null,
        previewImage: null
    }
    for (let urlVal of url) {
        if (urlVal.spotId === newObj.id) {
            newObj.previewImage = urlVal.url
        }
    }
    for (let ele of getReviews) {
        const obj = ele.dataValues
        if (obj.newspot === newObj.id) {
            newObj.avgRating = obj.avgRating
        }
    }
    payload.push(newObj)
}


    return res.status(200).json({Spots:payload})
});


router.post('/', requireAuth, async (req, res) => {
    const {user} = req;
    const {address,city,state,country,lat,lng,name,description,price} = req.body;

    if (!req.body) {
        const err = new Error("Body validation error");
        err.message = "Validation Error";
        err.statusCode = 400;
        err.errors = {
            "address": "Street address is required",
            "city": "City is required",
            "state": "State is required",
            "country": "Country is required",
            "lat": "Latitude is not valid",
            "lng": "Longitude is not valid",
            "name": "Name must be less than 50 characters",
            "description": "Description is required",
            "price": "Price per day is required"
          }
          console.log(err)
        return res.status(400).json(err)
    }

        const newSpot = await Spot.create({
            ownerId: user.id,
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
        });
        return res.status(201).json(newSpot)
});

module.exports = router;
