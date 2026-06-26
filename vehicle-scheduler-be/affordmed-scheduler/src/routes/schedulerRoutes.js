'use strict';

const { Router }      = require('express');
const { getSchedule } = require('../controllers/schedulerController');

const router = Router();

/**
 * @route  GET /api/schedule
 * @desc   Compute and return the optimised maintenance schedule for all depots
 * @access Protected (Bearer token validated against external APIs)
 */
router.get('/schedule', getSchedule);

module.exports = router;
