const Tour = require("../models/tourmodel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res) => {
	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: "All Tours",
		tours
	});
});

exports.getTour = (req, res) => {
	res.status(200).render('tour', {
		title: "Tour"
	});
}; 