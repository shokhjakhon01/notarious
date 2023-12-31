const User = require("../models/usermodel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const factory = require("../controllers/handleFactory")

const filterObj = (obj, ...allowedFields) => {
  let newObj = {}
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key]
  })
  return newObj
}

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError("This is not a valid route. Please use /update route", 400)
    )
  }

  const filteredBody = filterObj(req.body, "name", "email")

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: "success",
    data: null,
  })
})

exports.getAllUsers = factory.getAll(User)

exports.getUser = factory.getOne(User)

exports.createUser = factory.createOne(User)

exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)
