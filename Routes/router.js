const router = require("express").Router();
const controller = require("../Controller/controller");

router.post("/register", controller.registerUser);
router.post("/login", controller.userLogin);
router.get("/hotels", controller.getHotels);
router.post("/bookings/:userId/:hotelName", controller.bookHotel);
router.put("/bookings/:userId", controller.updateBooking);
router.delete("/bookings/:userId/:bookingId", controller.deleteBooking);
router.get("/bookings/:userId", controller.getUserBookings);
router.put("/reviews", controller.addReview);
router.get("/reviews/:hotelName", controller.getHotelReviews);
router.get("/logout", controller.logout);
router.all("*", controller.handle404);

module.exports = router;