const mongoose = require("mongoose");

const DB = "BonStay";

mongoose.connect(`mongodb://localhost:27017/${DB}`)
    .then(() => console.log(`DB connection successfull for database ${DB}`));

const hotels = new mongoose.Schema({
    hotelName: {
        type: String,
        required: true
    },
    description: String,
    amenities: String,
    phoneNo: {
        type: Number,
        validate: {
            validator: function (val) {
                return String(val).length === 10;
            },
            message: "Enter a valid phone no. with 10 digits"
        }
    },
    address: String,
    reviews: {
        type: Array,
        default: []
    }
},
{
    timestamps: { createdAt: true, updatedAt: true }
}
);

const users = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true,
        minLength: [3, "Enter a valid name with at least 3 characters"]
    },
    address: String,
    email: {
        type: String,
        validate: {
            validator: function (val) {
                return /\w+@\w+/.test(val);
            },
            message: "Enter a valid email id"
        }
    },
    phoneNo: {
        type: Number,
        validate: {
            validator: function (val) {
                return String(val).length === 10;
            },
            message: "Enter a valid phone no. with 10 digits"
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Enter a valid password with at least 8 and not more than 12 characters"],
        maxLength: [12, "Enter a valid password with at least 8 and not more than 12 characters"]
    },
    userBookings: {
        type: Array,
        default: []
    }
});

const bookings = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (val) {
                return val >= new Date();
            },
            message: "Start Date should be a date greater than or equal to today"
        }
    },
    endDate: {
        type: Date,
        required: true
    },
    noOfPersons: {
        type: Number,
        min: [1, "Number of Persons should be a valid number greater than 0 and less than or equal to 5"],
        max: [5, "Number of Persons should be a valid number greater than 0 and less than or equal to 5"],
        default: 1
    },
    noOfRooms: {
        type: Number,
        min: [1, "Number of rooms should be a valid number greater than 0 and less than or equal to 3"],
        max: [3, "Number of rooms should be a valid number greater than 0 and less than or equal to 3"],
        default: 1
    },
    typeOfRoom: String
});

const Hotels = mongoose.model("hotels", hotels);
const Users = mongoose.model("users", users);
const Bookings = mongoose.model("bookings", bookings);

module.exports = { Hotels, Users, Bookings };