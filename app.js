const express = require("express")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const reviewRouter = require("./routes/reviewRoutes")
const viewRouter = require("./routes/viewRoutes")
const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const cors = require("cors")
const mongoSanitize = require("express-mongo-sanitize")
const cookieParser = require("cookie-parser")
const xss = require("xss-clean")
const hpp = require("hpp")

// limit request
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests this IP. try again a hour",
})

const app = express()

app.set("view engine", "pug")
app.set("views", `${__dirname}/views`)
app.use(cors())
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
app.use(express.json({ limit: "10kb" }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(xss())
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAvarage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
)

app.use(express.static(`${__dirname}/public`))

app.use("/api", limiter)

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString()
  console.log(req.cookies)
  next()
})

app.use("/", viewRouter)
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} in this server!`))
})

app.use(globalErrorHandler)

module.exports = app
