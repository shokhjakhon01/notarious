const APIFeatures = require("../utils/apiFeatures")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id, {
      runValidators: true,
    })
    if (!doc) {
      return next(new AppError("No tour found with this ID", 404))
    }

    res.status(204).json({
      status: "success",
      data: null,
    })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      return next(new AppError("No tour found with this ID", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
      status: "success",
      results: Model.length,
      data: {
        data: doc,
      },
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError("No Documnet found with this ID", 404))
    }

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    })
  })

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {}

    if (req.params.tourId) filter = { tour: req.params.tourId }

    //execution
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination()

    const doc = await features.query

    res.status(200).json({
      status: "success",
      requestedTime: req.requestedTime,
      results: doc.length,
      data: {
        doc,
      },
    })
  })
