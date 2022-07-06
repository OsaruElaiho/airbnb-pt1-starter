const { BadRequestError } = require("../utils/errors")
const Listing = require("./listing")
const Booking = require("./booking")
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testListingIds,
} = require("../tests/common")

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

describe("Booking", () => {
  describe("Test createBooking", () => {
    test("Can create a new booking with valid params", async () => {
      // It should create a dummy user object containing only the username property equal to jlo
      const user = { username: "jlo" }
      // select one of the listing ids from the testListingIds array
      const listingId = testListingIds[0]
      // use the Listing model to fetch that listing.
      const listing = await Listing.fetchListingById(listingId)

      // should create a newBooking object with startDate, endDate, and guests properties
      const startDate = new Date("06-06-2022")
      const endDate =new Date("06-12-2022")
      const guests = 1;
      const newBooking = { startDate: startDate, endDate: endDate, guests: guests }
      // should use the createBooking method on the Booking model to create a 
      // new booking using the newBooking object, listing, and user.
      const booking = await Booking.createBooking({ newBooking, listing, user })
      booking.totalCost = Number(booking.totalCost) 

      // check that the booking returned by that method is equal to an 
      // expected booking, containing the properties
      expect(booking).toEqual({
        id: expect.any(Number),
        startDate: new Date("06-06-2022"),
        endDate: new Date("06-12-2022"),
        paymentMethod: "card",
        guests: 1,
        totalCost: Math.ceil((((newBooking.endDate-newBooking.startDate)/86400000)+1)  * (listing.price * 1.1)) ,
        // totalCost: Math.ceil(3 * (Number(listing.price) + Number(listing.price) * 0.1)),
        listingId: listingId,
        username: "jlo",
        hostUsername: "lebron",
        userId: expect.any(Number),
        createdAt: expect.any(Date),
      })
    })

    test("Throws error with invalid params", async () => {
      // Start the test by expecting exactly one assertion
      expect.assertions(1)
      // should create a dummy user object containing only the username property equal to jlo
      const user = { username: "jlo" }
      // should select one of the listing ids from the testListingIds array. 
      const listingId = testListingIds[0]
      // should then use the Listing model to fetch that listing
      const listing = await Listing.fetchListingById(listingId)

      // should create a newBooking object with only an endDate
      const endDate = "06-12-2022"
      const newBooking = { endDate }

      // Use a try...catch... block to call the Booking.createBooking method 
      // with the newBooking, listing, and user
      try {
        await Booking.createBooking({ newBooking, listing, user })
      } catch (err) {
        //  In the catch block, expect the error to be an instance of BadRequestError.
        expect(err instanceof BadRequestError).toBeTruthy()
      }
    })
  })
  
  describe("Test listBookingsFromUser", () => {
    test("Fetches all of the authenticated users' bookings", async () => {
      const user = { username: "jlo" }
      const listingId = testListingIds[0]
      const listing = await Listing.fetchListingById(listingId)

      const bookings = await Booking.listBookingsFromUser(user)
      expect(bookings.length).toEqual(2)

      const firstBooking = bookings[bookings.length - 1]

      firstBooking.totalCost = Number(firstBooking.totalCost)

      expect(firstBooking).toEqual({
        id: expect.any(Number),
        startDate: new Date("03-05-2021"),
        endDate: new Date("03-07-2021"),
        paymentMethod: "card",
        guests: 1,
        username: "jlo",
        hostUsername: "lebron",
        totalCost: Math.ceil(3 * (Number(listing.price) + Number(listing.price) * 0.1)),
        listingId: listingId,
        userId: expect.any(Number),
        createdAt: expect.any(Date),
      })
    })

    test("Returns empty array when user hasn't booked anything", async () => {
      const user = { username: "lebron" }

      const bookings = await Booking.listBookingsFromUser(user)
      expect(bookings).toHaveLength(0)
    })
  })

  describe("Test listBookingsForUserListings", () => {
    test("Fetches all of the bookings for any listing the user owns", async () => {
      const user = { username: "lebron" }
      const listingId = testListingIds[0]
      const listing = await Listing.fetchListingById(listingId)

      const bookings = await Booking.listBookingsForUserListings(user)
      expect(bookings.length).toEqual(2)

      const firstBooking = bookings[bookings.length - 1]

      firstBooking.totalCost = Number(firstBooking.totalCost)

      expect(firstBooking).toEqual({
        id: expect.any(Number),
        startDate: new Date("03-05-2021"),
        endDate: new Date("03-07-2021"),
        paymentMethod: "card",
        guests: 1,
        username: "jlo",
        hostUsername: "lebron",
        totalCost: Math.ceil(3 * (Number(listing.price) + Number(listing.price) * 0.1)),
        listingId: listingId,
        userId: expect.any(Number),
        createdAt: expect.any(Date),
      })
    })

    test("Returns empty array when users listing have no bookings", async () => {
      const user = { username: "serena" }

      const bookings = await Booking.listBookingsForUserListings(user)
      expect(bookings).toHaveLength(0)
    })
  })
})
