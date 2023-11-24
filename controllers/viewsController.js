const Tour = require("../models/tourmodel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res) => {
	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: "All Tours",
		tours
	});
});

exports.getTour = catchAsync(async (req, res) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: "reviews",
		fields: "review rating user"
	});

	res.status(200).render('tour', {
		title: `${tour.name} tour`,
		tour
	});
});

exports.getLoginForm = catchAsync(async (req, res) => {
	res.status(200).render('login', {
		title: "Login into your account",
	});
});