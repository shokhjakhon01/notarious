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
router.route("/tour-stats").get(getToursStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/").get(protect, getAllTours).post(createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
