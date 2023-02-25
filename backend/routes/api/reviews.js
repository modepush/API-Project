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
    const {user} = req;
    const getReviews = await Review.findAll({
        include: [
            {model: User.scope('defaultScope', 'username')},
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
    getReviews.forEach(obj => {
        payload.push(obj.toJSON())
    });

    for (let i = 0; i < payload.length; i++) {
        const obj = payload[i];

        const img = await SpotImage.findAll({
            where: {
                spotId: {
                    [Op.eq]: obj.id
                },
                preview: true
            }
        });

        img.forEach(ele => {
            obj.Spot.previewImage = ele.url
        });

        if (!obj.Spot.previewImage) {
            obj.Spot.previewImage = "Preview Image N/A"
        }
    }

    res.json({Reviews:payload})
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
        await findReview.destroy()
        res.status(200).json({
            message: "Successfully deleted",
            statusCode: 200
        })
    } else {
        const err = new Error("Review couldn't be found")
        err.status = 404
        res.status(404).json({
            message: err.message,
            statusCode: err.status
        });
    }
})




module.exports = router;
