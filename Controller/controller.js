const { log } = require("console");
const mongoose = require("mongoose");
const {
    Users,
    Hotels,
    Bookings
} = require("../Models/schema");
const { generateUserId, generateBookingId } = require("../utilities/idGenerator");

const payload = (status, message) => {
    return {
        status: status ? "success" : "error",
        data: { message }
    }
};

const getValidationErrors = err => {
    let errArr = [];
    for (let prop in err.errors) {
        errArr.push(err.errors[prop].message);
    }
    return errArr;
}

// register
exports.registerUser = async (req, res) => {
    try {
        const user = {
            userId: `U-${generateUserId()}`,
            ...req.body
        };

        const data = await Users.create(user);
        // log(data);

        res.status(201).json(payload(1, `Successfully registered with user id ${ data.userId }`))

    }
    catch (err) {
        // log(err);
        if (err instanceof mongoose.Error.ValidationError) {
            let messages = getValidationErrors(err);
            res.status(400).json(payload(0, messages.length===1 ? messages[0] : messages));
        }
        else {
            res.status(400).json(payload(0, err));
        }
    }
}

// login
exports.userLogin = async (req, res) => {
    try {
        const { userId, password } = req.body;

        // check for username and password
        if (!userId || !password) {
            throw "Enter complete details"
        }

        // validate password
        if (password.length < 8 || password.length > 12) {
            throw "Enter a valid password with at least 8 and not more than 12 characters"
        }

        // find user with given credentials
        const data = await Users.findOne({
            $and: [{ userId }, { password }]
        });

        if (data) {
            res.status(201)
                .cookie("username", userId)
                .json(payload(1, "Login success"));
        }
        else {
            res.status(400).json(payload(0, "Incorrect user id or password"));
        }
    }
    catch (err) {
        // log(err);
        if (err instanceof mongoose.Error.ValidationError) {
            let messages = getValidationErrors(err);
            res.status(400).json(payload(0, messages.length===1 ? messages[0] : messages));
        }
        else {
            res.status(400).json(payload(0, err));
        }
    }
}

// get all hotels
exports.getHotels = async (req, res) => {
    try {
        const data = await Hotels.find({}, { _id: 0, __v: 0 });
        
        res.status(200).json({
            status: "success",
            results: data.length,
            data: {hotels: data}
        })
    }
    catch (err) {
        // log(err);
        res.status(400).json(payload(0, err));
    }
}

// book hotel
exports.bookHotel = async (req, res) => {
    try {
        const { userId, hotelName } = req.params;
        // log(userId, hotelName);
        
        // check if user exists
        const userData = await Users.findOne({ userId });
        log(`user id : ${userData}`);
        if (!userData) { throw "Not a valid User Id"; }

        // check if hotel name exists
        const hotelData = await Hotels.findOne({ hotelName });
        if (!hotelData) { throw "Not a valid Hotel Name"; }

        // check for end date >= start date
        let { startDate, endDate } = req.body;
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        if (endDate < startDate) { throw "End Date should be a date greater than or equal to start date"; }

        // check for dates overlap
        for (let booking of userData.userBookings) {
            const checkStartBtwn = (booking.startDate <= startDate) && (startDate <= booking.endDate);
            const checkEndBtwn = (booking.startDate <= endDate) && (endDate <= booking.endDate);
            const checkOutter = (booking.startDate > startDate) && (booking.endDate < endDate);
            log(checkStartBtwn, checkEndBtwn, checkOutter);
            if (checkStartBtwn || checkEndBtwn || checkOutter) {
                throw "You have a booking on the same date";
            }
        }

        const booking = {
            bookingId: `B-${generateBookingId()}`,
            ...req.body
        }

        const data = await Bookings.create(booking);

        await Users.updateOne({ userId }, {
            $push: {userBookings: data}
        })

        res.status(201).json(payload(1, `Successfully made a booking with booking id ${data.bookingId}`));
    }
    catch (err) {
        // log(err);
        if (err instanceof mongoose.Error.ValidationError) {
            let messages = getValidationErrors(err);
            res.status(400).json(payload(0, messages.length===1 ? messages[0] : messages));
        }
        else {
            res.status(400).json(payload(0, err));
        }
    }
}

// update booking
exports.updateBooking = async (req, res) => {
    try {
        const { userId } = req.params;
        let { startDate, endDate, bookingId } = req.body;

        // check for end date >= start date
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        if (startDate < new Date()) { throw "Start date should be a date greater than or equal to today"; }
        if (endDate < startDate) { throw "End Date should be a date greater than or equal to start date"; }

        const data = await Users.findOneAndUpdate({ userId, "userBookings.bookingId": bookingId }, {
            $set: {
                "userBookings.$.startDate": startDate,
                "userBookings.$.endDate": endDate,
            }
        }, { new: true });
        
        if (data) {
            await Bookings.updateOne({ bookingId }, { $set: { startDate, endDate } });
            res.status(201).json(payload(1, `Successfully rescheduled the booking with booking id ${bookingId}`));
        }
        else {
            res.status(400).json(payload(0, "Not a valid Booking Id or User Id"));
        }
    }
    catch (err) {
        // log(err);
        if (err instanceof mongoose.Error.ValidationError) {
            let messages = getValidationErrors(err);
            res.status(400).json(payload(0, messages.length===1 ? messages[0] : messages));
        }
        else {
            res.status(400).json(payload(0, err));
        }
    }
}

// delete booking
exports.deleteBooking = async (req, res) => {
    try {
        const { userId, bookingId } = req.params;

        const data = await Users.findOneAndUpdate({ userId, "userBookings.bookingId": bookingId }, {
            $pull: {
                userBookings: {bookingId}
            }
        });
        if (data) {
            await Bookings.deleteOne({ bookingId });
            res.status(201).json(payload(1, `Successfully deleted the booking with booking id ${bookingId}`));
        }
        else {
            res.status(400).json(payload(0, "Could not delete the booking"));
        }
    }
    catch (err) {
        // log(err);
        res.status(400).json(payload(0, err));
    }
}

// get user bookings
exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await Users.findOne({ userId });
        if (data) {
            if (data.userBookings.length > 0) {
                res.status(200).json({
                    status: "success",
                    results: data.userBookings.length,
                    data: data.userBookings
                });
            }
            else {
                throw "No Bookings done yet"
            }
        }
        else {
            throw "Invalid user ID"
        }
    }
    catch (err) {
        res.status(400).json(payload(0, err));
    }
}

// add review
exports.addReview = async (req, res) => {
    try {
        const userId = req.cookies.username;
        if (!userId) {
            throw "You are not logged in to add a review";
        }

        const { hotelName, reviews } = req.body;
        if (!hotelName || !reviews) { throw "Please provide all the required details." };

        const data = await Hotels.findOneAndUpdate({ hotelName }, {
            $push: { reviews }
        }, { new: true });

        if (data) {
            res.status(201).json(payload(1, `Successfully added the review for ${hotelName}`));
        }
        else {
            throw "Not a valid Hotel Name";
        }
    }
    catch (err) {
        log(err);
        res.status(400).json(payload(0, err));
    }
}

// get reviews
exports.getHotelReviews = async (req, res) => {
    try {
        const { hotelName } = req.params;

        const data = await Hotels.findOne({ hotelName });
        if (data) {
            if (data.reviews.length > 0) {
                res.status(200).json({
                    status: "success",
                    results: data.reviews.length,
                    data: {reviews: data.reviews}
                });
            }
            else {
                throw `No reviews added yet for ${hotelName}`;
            }
        }
        else {
            throw `${hotelName} is not a valid hotel`
        }
    }
    catch (err) {
        res.status(400).json(payload(0, err));
    }
}

// logout
exports.logout = async (req, res) => {
    try {
        const userId = req.cookies.username;
        if (!userId) {
            throw "You are not logged in";
        }
        res.clearCookie("username");
        res.status(201).json({ "message": "You are logged out!!" });
    }
    catch (err) {
        log(err);
        res.status(400).json(payload(0, err));
    }
}

// handle 404
exports.handle404 = async (req, res) => {
    res.status(404).json(payload(0, "Invalid url"));
}