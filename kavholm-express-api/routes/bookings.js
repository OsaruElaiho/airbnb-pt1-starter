const express = require("express")
const Booking = require("../models/booking")
const security = require("../middleware/security")
const permissions = require("../middleware/permissions")
const router = express.Router()

router.get("/", security.requireAuthenticatedUser, async (req, res, next) => {
  try {
    // list all bookings created by authenticated user
    const { user } = res.locals
    const bookings = await Booking.listBookingsFromUser(user)
    return res.status(200).json({ bookings })
  } catch (err) {
    next(err)
  }
})

router.get("/listings", security.requireAuthenticatedUser, async (req, res, next) => {
  try {
    // list all bookings created for any user-owned listings
    const { user } = res.locals
    const bookings = await Booking.listBookingsForUserListings(user)
    return res.status(200).json({ bookings })
  } catch (err) {
    next(err)
  }
})

router.get(
  "/listings/:listingId/",
  security.requireAuthenticatedUser,
  permissions.authedUserIsListingOwner,
  async (req, res, next) => {
    try {
      // list all bookings for a single listing
      const { listing } = res.locals
      const bookings = await Booking.listBookingsForListing(listing.id)
      return res.status(200).json({ bookings })
    } catch (err) {
      next(err)
    }
  }
)

// Should be a POST request to the "bookings/listings/:listingId/" endpoint.
// Should request an authenticated user.
// It should have permissions that ensure the authenticated user does not own the 
// listing that the booking is being made for.
router.post(
  "/listings/:listingId/",
  security.requireAuthenticatedUser,
  permissions.authedUserIsNotListingOwner,
  async (req, res, next) => {
    //  It should have an async router handler that executes a try...catch block.
    try {
      // extract the user and listing from res.locals
      const { user, listing } = res.locals
      // extract the newBooking object from req.body
      // should pass the user, listing, and newBooking to the Booking.createBooking method and create a new booking
      const booking = await Booking.createBooking({ user, listing, newBooking: req.body.newBooking })
      // should return a 201 JSON response with the booking
      return res.status(201).json({ booking })
    } catch (err) {
      // Any error should be passed to the next function in the catch block
      next(err)
    }
  }
)
module.exports = router
