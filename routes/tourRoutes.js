const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");
const reviewRoutes = require("../routes/reviewRoutes");

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTop,
  getToursStats,
  getMonthlyPlan,
} = tourController;

router.use("/:tourId/reviews", reviewRoutes);

router.route("/top-5-cheap").get(aliasTop, getAllTours);
router.route("/tour-stats").get(protect, restrictTo("admin", "lead-guide"), getToursStats);
router.route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", 'guide'), getMonthlyPlan);

router.route("/tours-within/:distance/center/:latlng/unit/:unit",).get(tourController.getToursWithin);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router.route("/")
  .get(protect, getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);

router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
