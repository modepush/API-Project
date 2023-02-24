const express = require('express');
const router = express.Router();
const {Spot, User, SpotImage, Review, sequelize, ReviewImage} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors1, handleValidationErrors2, handleValidationErrors3 } = require('../../utils/validation1');

const validateSignup = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
    check('lat')
      .isNumeric()
      .withMessage('Latitude is not valid'),
    check('lng')
      .isNumeric()
      .withMessage('Longitude is not valid'),
    check('name')
      .isLength({max: 50})
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
    check('price')
      .exists({ checkFalsy: true })
      .isNumeric()
      .withMessage('Price per day is required'),
    handleValidationErrors1
  ];

  const validatesSpot = [
    check('id')
        .exists({ checkFalsy: true }),
    handleValidationErrors2
  ];

  const validatesReview = [
    check('review')
        .exists({ checkFalsy: true })
        .isString()
        .withMessage('Review text is required'),
    check('stars')
        .isInt({min: 1, max: 5})
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors3
  ];


router.get('/:spotId/reviews', validatesSpot, async (req, res) => {
    const getSpot = await Spot.findByPk(req.params.spotId);
    const getReview = await Review.findAll({
        include: [
            {model: User.scope('defaultScope', 'username')},
            {model: ReviewImage.scope('removeAnId', 'removeCAUA')}
        ],
        where: {
            spotId: {
                [Op.eq]: getSpot.id
            }
        }
    })

    res.status(200).json({Reviews: getReview})

});


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


router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const {user} = req
    const getSpot = await Spot.findByPk(req.params.spotId);
    const {review,stars} = req.body;

    if (!getSpot) {
        return res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }

    const newReview = await Review.create({
        spotId: getSpot.id,
        userId: user.id,
        review,
        stars
    });

    const reviewExists = await Review.findOne({
        where: {
            id: {
                [Op.eq]: newReview.id
            }
        }
    });

    if (reviewExists) {
        return res.status(403).json({
            message: "User already has a review for this spot",
            statusCode: 403
        });
    }

    res.status(201).json(newReview)
});

router.post('/:spotId/images', [requireAuth, validatesSpot], async (req, res) => {
    const findSpot = await Spot.findByPk(req.params.spotId);

    const {id,url,preview} = await SpotImage.create({
        spotId: findSpot.id,
        url: req.body.url,
        preview: req.body.preview
    });

    const newImg = {id,url,preview}


    res.status(200).json(newImg)

});


router.post('/', [requireAuth, validateSignup], async (req, res) => {
    const {user} = req;
    const {address,city,state,country,lat,lng,name,description,price} = req.body;

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

router.put('/:spotId', [requireAuth, validateSignup], async (req, res) => {
    const findSpot = await Spot.findByPk(req.params.spotId)
    const {address,city,state,country,lat,lng,name,description,price} = req.body

    if (address) {
        findSpot.address = address
    }
    if (city) {
        findSpot.city = city
    }
    if (state) {
        findSpot.state = state
    }
    if (country) {
        findSpot.country = country
    }
    if (lat) {
        findSpot.lat = lat
    }
    if (lng) {
        findSpot.lng = lng
    }
    if (name) {
        findSpot.name = name
    }
    if (description) {
        findSpot.description = description
    }
    if (price) {
        findSpot.price = price
    }

    await findSpot.save()

    res.status(200).json(findSpot)

});

router.delete('/:spotId', requireAuth, async (req, res) => {
    const findSpot = await Spot.findByPk(req.params.spotId)

    if (findSpot) {
        await findSpot.destroy()
        res.status(200).json({
            message: 'Successfully deleted',
            statusCode: 200
        })
    } else {
        res.status(404).json({
            message: "Spot couldn't be found",
            statusCode: 404
        })
    }
});

module.exports = router;
