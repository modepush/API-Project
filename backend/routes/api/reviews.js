const express = require('express');
const router = express.Router();
const {Spot, User, SpotImage, Review, sequelize, ReviewImage} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors1, handleValidationErrors2 } = require('../../utils/validation1');


router.get('/current', requireAuth, async (req, res) => {
    const {user} = req
    const reviewUser = await Review.findAll({
        include: [
            {model: User.scope('defaultScope','username')},
            {model: Spot.scope('removeCAUA', 'removeDescription')},
            {model: ReviewImage.scope('removeCAUA', 'removeAnId')}
        ],
        where: {
            userId: {
                [Op.eq]: user.id
            }
        }
    });
    const payload = [];

    for (let i = 0; i < reviewUser.length; i++) {
        let ele = reviewUser[i];

        const newObj = {
            id: ele.id,
            spotId: ele.spotId,
            userId: ele.userId,
            review: ele.review,
            stars: ele.stars,
            createdAt: ele.createdAt,
            updatedAt: ele.updatedAt,
            User: {
                id: ele.User.id,
                firstName: ele.User.firstName,
                lastName: ele.User.lastName
            },
            Spot: {
                id: ele.Spot.id,
                ownerId: ele.Spot.ownerId,
                address: ele.Spot.address,
                city: ele.Spot.city,
                state: ele.Spot.state,
                country: ele.Spot.country,
                lat: ele.Spot.lat,
                lng: ele.Spot.lng,
                name: ele.Spot.name,
                price: ele.Spot.price,
                previewImage: ele.ReviewImages[0].url
            },
            ReviewImages: [
                {
                    id: ele.ReviewImages[0].id,
                    url: ele.ReviewImages[0].url
                }
            ]
        }
        payload.push({Reviews:newObj})
    }

    res.json(payload)

})




module.exports = router;
