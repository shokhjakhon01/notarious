const dotenv = require("dotenv").config({ path: "./config.env" })
const mongoose = require("mongoose")
const app = require("./app")

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("db connected successfully!"))

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () =>
  console.log("app running on port " + PORT)
)

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})
