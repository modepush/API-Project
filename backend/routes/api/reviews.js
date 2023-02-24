const express = require('express');
const router = express.Router();
const {Spot, User, SpotImage, Review, sequelize, ReviewImage} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors4, handleValidationErrors2, handleValidationErrors3 } = require('../../utils/validation1');


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

  const validatesId = [
    check('id')
        .exists({checkFalsy: true})
        .withMessage("Review couldn't be found"),
    handleValidationErrors4
  ]

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
                previewImage: null
            },
            ReviewImages: []
        }
        const url = await ReviewImage.scope('removeCAUA', 'removeAnId').findAll({
            where: {
                reviewId: {
                    [Op.eq]: newObj.id
                }
            }
        })
        for (let j = 0; j < url.length; j++) {
            const img = url[j];
            newObj.Spot.previewImage = img.url
            newObj.ReviewImages.push(img)
        }

        payload.push({Reviews:newObj})
    }
    res.json(payload)

});


router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const getReview = await Review.findByPk(req.params.reviewId);

    if (!getReview) {
        res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404
        });
    }

    const numReviews = await ReviewImage.findAll({
        where: {
            reviewId: {
                [Op.eq]: getReview.id
            }
        }
    });

    if (numReviews.length > 10) {
        res.status(403).json({
            message: "Maximum number of images for this resource was reached",
            statusCode: 403
        })
    }

    const {id,url} = await ReviewImage.create({
        reviewId: getReview.id,
        url: req.body.url
    });
    const newImg = {id,url};

    res.status(200).json(newImg)

});


router.put('/:reviewId', requireAuth, async(req, res) => {
    const findReview = await Review.findByPk(req.params.reviewId);
    const {review,stars} = req.body;

    if (!findReview) {
        res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404
        })
    }

    // const revVal = findReview.review;
    // const starVal = findReview.stars;

    // if (!revVal && typeof starVal !== 'number' && (starVal < 1 || starVal > 5)) {
    //     res.status(400).json({
    //         message: "Validation error",
    //         statusCode: 400,
    //         errors: {
    //             review: "Review text is required",
    //             stars: "Stars must be an integer from 1 to 5"
    //         }
    //     })
    // }
    // if (!revVal && typeof starVal == 'number' && starVal >= 1 && starVal <= 5) {
    //     res.status(400).json({
    //         message: "Validation error",
    //         statusCode: 400,
    //         errors: {
    //             review: "Review text is required"
    //         }
    //     })
    // }
    // if (revVal && typeof starVal !== 'number' && (starVal < 1 || starVal > 5)) {
    //     res.status(400).json({
    //         message: "Validation error",
    //         statusCode: 400,
    //         errors: {
    //             stars: "Stars must be an integer from 1 to 5"
    //         }
    //     })
    // }

    if (review) {
        findReview.review = review
    }

    if (stars) {
        findReview.stars = stars
    }

    await findReview.save()

    res.status(200).json(findReview)
});

router.delete('/:reviewId', requireAuth, async (req, res) => {
    const findReview = await Review.findByPk(req.params.reviewId);

    if (findReview) {
        res.status(200).json({
            message: "Successfully deleted",
            statusCode: 200
        })
    } else {
        res.status(404).json({
            message: "Review couldn't be found",
            statusCode: 404
        })
    }
})


module.exports = router;
