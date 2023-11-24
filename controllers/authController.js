const User = require("../models/usermodel")
const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")
const AppError = require("../utils/appError")
const { promisify } = require("util")
const sendEmail = require("../utils/email")
const crypto = require("crypto")

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  }

  if (process.env.NODE_ENV == "production") cookiesOptions.secure = true

  res.cookie("jwt", cookiesOptions)

  user.password = undefined

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)

  createSendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400))
  }
  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    return next(new AppError("Incorrect email  or password", 404))
  }

  const correct = await user.correctPassword(password, user.password)

  if (!correct) {
    return next(new AppError("Incorrect email or password", 401))
  }

  createSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new AppError("You are not login! Please login for access", 401))
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  const currentUser = await User.findById(decoded.id)

  if (!currentUser) {
    next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    )
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed the password", 401))
  }

  req.user = currentUser
  next()
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You dont have permission to do this action", 403)
      )
    }
    next()
  }
}

exports.forgotPasssword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return next(new AppError("There is no user found"))
  }

  const resetToken = user.createForgotPaswordToken()

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset/${resetToken}`

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid 10 min)",
      message: message,
    })

    res.status(200).json({
      status: "success",
      message: "Token send to email!",
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      new AppError("There was an error sendding the email.Try again later", 500)
    )
  }
})

exports.resetPasssword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password")

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm

  await user.save()

  createSendToken(user, 200, res)
})
