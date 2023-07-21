const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  signup,
  login,
  forgotPasssword,
  resetPasssword,
  protect,
  updatePassword,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);

router.post("/forgot", forgotPasssword);
router.patch("/reset/:token", resetPasssword);
router.patch("/update", protect, updatePassword);
router.patch("/updateMe", protect, userController.updateMe);
router.delete("/deleteMe", protect, userController.deleteMe);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
