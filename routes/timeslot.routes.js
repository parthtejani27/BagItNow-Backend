const express = require("express");
const router = express.Router();
const timeslotController = require("../controllers/timeslot.controller");
const {
  adminAuth,
  authorize,
  userAuth,
} = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const timeslotValidators = require("../validations/timeslot.validation");

// Public routes
router.get(
  "/available",
  validate(timeslotValidators.getAvailable),
  timeslotController.getAvailableSlots.bind(timeslotController)
);

// Protected routes (requires authentication)
router.post(
  "/:slotId/reserve",
  validate(timeslotValidators.reserve),
  timeslotController.reserveSlot.bind(timeslotController)
);

router.post(
  "/:slotId/release",
  validate(timeslotValidators.release),
  timeslotController.releaseSlot.bind(timeslotController)
);

// Admin routes
router.post(
  "/generate",
  adminAuth,
  authorize(),
  validate(timeslotValidators.generate),
  timeslotController.generateSlots.bind(timeslotController)
);

router.get(
  "/weekly",
  userAuth,
  validate(timeslotValidators.getWeekly),
  timeslotController.getWeeklyTimeslots.bind(timeslotController)
);

module.exports = router;
