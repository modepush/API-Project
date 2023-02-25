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


router.get('/:spotId/reviews', async (req, res) => {
    const getSpot = await Spot.findByPk(req.params.spotId);

    if (!getSpot) {
        const err = new Error("Spot couldn't be found");
        err.status = 404
        res.status(404).json({
            message: err.message,
            statusCode: err.status
        });
    }

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
    });

    res.status(200).json({Reviews: getReview})

});


router.get('/current', requireAuth, async (req, res) => {
    const {user} = req
    const getSpots = await Spot.findAll({
        where: {
            ownerId: user.id
        }
    });

    let payload = [];
    getSpots.forEach(spot => {
        payload.push(spot.toJSON())
    });

    for (let i = 0; i < payload.length; i++) {
        const obj = payload[i];

        const revAvg = await Review.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']
            ],
            where: {
                spotId: {
                    [Op.eq]: obj.id
                }
            }
        });
        const newRev = revAvg.toJSON();
        const val = Object.values(newRev);
        obj.avgRating = val[0]

        const getPreview = await SpotImage.findAll({
            where: {
                spotId: {
                    [Op.eq]: obj.id
                },
                preview: {
                    [Op.eq]: true
                }
            }
        });
        getPreview.forEach(img => {
            if (img.preview === true) {
                obj.previewImage = img.url
            }
        });
        if (!obj.previewImage) {
            obj.previewImage = 'Preview Image N/A'
        }
    }

    res.status(200).json({Spots:payload})

});

router.get('/:spotId', async (req, res) => {
    const getSpot = await Spot.findByPk(req.params.spotId)

    if (!getSpot) {
        const err = new Error("Spot couldn't be found");
        err.status = 404
        res.status(404).json({
            message: err.message,
            code: err.status
        });
    }

    const revCountAvg = await getSpot.getReviews({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'numReviews'],
            [sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating']
        ]
    });

    const newSpot = getSpot.toJSON();
    const newRev = revCountAvg[0];
    const formatRev = newRev.toJSON()
    const val = Object.values(formatRev)

    newSpot.numReviews = val[0];
    newSpot.avgStarRating = val[1];

    const spotImg = await SpotImage.scope('defaultScope').findAll({
        where: {
            spotId: {
                [Op.eq]: newSpot.id
            }
        }
    });

    newSpot.SpotImages = spotImg

    const user = await User.scope('defaultScope', 'username').findOne({
        where: {
            id: {
                [Op.eq]: newSpot.ownerId
            }
        }
    });

    newSpot.Owner = user

    res.status(200).json(newSpot)
});

router.get('/', async (req, res) => {

    const getSpots = await Spot.findAll();

    let payload = [];
    getSpots.forEach(spot => {
        payload.push(spot.toJSON())
    });

    for (let i = 0; i < payload.length; i++) {
        const obj = payload[i];

        const revAvg = await Review.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating']
            ],
            where: {
                spotId: {
                    [Op.eq]: obj.id
                }
            }
        });
        const newRev = revAvg.toJSON();
        const val = Object.values(newRev);
        obj.avgRating = val[0]

        const getPreview = await SpotImage.findAll({
            where: {
                spotId: {
                    [Op.eq]: obj.id
                },
                preview: {
                    [Op.eq]: true
                }
            }
        });
        getPreview.forEach(img => {
            if (img.preview === true) {
                obj.previewImage = img.url
            }
        });
        if (!obj.previewImage) {
            obj.previewImage = 'Preview Image N/A'
        }
    }

    res.status(200).json({Spots:payload})
});


router.post('/:spotId/reviews', requireAuth, async (req, res) => {
    const {user} = req
    const getSpot = await Spot.findByPk(req.params.spotId);
    const {review,stars} = req.body;

    const reviewExists = await Review.findOne({
        where: {
            spotId: {
                [Op.eq]: req.params.spotId
            }
        }
    });

    if (!getSpot) {
        const err = new Error("Spot couldn't be found");
        err.status = 404
        res.status(404).json({
            message: err.message,
            statusCode: err.status
        });
    } else if (reviewExists) {
        const err = new Error("User already has a review for this spot");
        err.status = 403
        res.status(403).json({
            message: err.message,
            statusCode: err.status
        });
    } else {
        const newReview = await Review.create({
            spotId: getSpot.id,
            userId: user.id,
            review,
            stars
        });

        res.status(201).json(newReview)
    }

});

router.post('/:spotId/images', requireAuth, async (req, res) => {
    const findSpot = await Spot.findByPk(req.params.spotId);

    if (!findSpot) {
        const err = new Error("Spot couldn't be found");
        err.status = 404
        res.status(404).json({
            message: err.message,
            statusCode: err.status
        });
    }

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

    if (!findSpot) {
        const err = new Error("Spot couldn't be found");
        err.status = 404
        res.status(404).json({
            message: err.message,
            statusCode: err.status
        });
    }

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
        const err = new Error("Spot couldn't be found");
        err.status = 404
        res.status(404).json({
            message: err.message,
            statusCode: err.status
        });
    }
});

module.exports = router;
