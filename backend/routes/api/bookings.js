const express = require('express');
const router = express.Router();
const {Spot, User, SpotImage, Review, sequelize, ReviewImage, Booking} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors1, handleValidationErrors2, handleValidationErrors3 } = require('../../utils/validation1');


router.get('/current', requireAuth, async (req, res) => {
    const {user} = req
    const getBooking = await Booking.scope('idandspotId').findAll({
        include: [
            {model: Spot.scope('removeCAUA', 'removeDescription')}
        ],
        where: {
            userId: user.id
        }
    });

    const payload = [];
    getBooking.forEach(obj => {
        payload.push(obj.toJSON())
    });

    const booking = await Booking.findAll({
        where: {
            userId: user.id
        }
    });

    for (let i = 0; i < payload.length; i++) {
        const ele = payload[i];
        const img = await SpotImage.findAll({
            where: {
                spotId: ele.Spot.id,
                preview: true
            }
        });
        img.forEach(inImg => {
            if (ele.Spot.id === inImg.spotId) {
                ele.Spot.previewImage = inImg.url
            }
        });
        if (!ele.Spot.previewImage) {
            ele.Spot.previewImage = "Preview Image N/A"
        };

        booking.forEach(inele => {
            if (ele.id === inele.id) {
                ele.userId = inele.userId
                ele.startDate = inele.startDate
                ele.endDate = inele.endDate
                ele.createdAt = inele.createdAt
                ele.updatedAt = inele.updatedAt
            }
        });
    }

    res.status(200).json(payload)
});




module.exports = router;
