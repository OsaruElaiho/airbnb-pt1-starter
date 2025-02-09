const request = require("supertest")
const app = require("../app")

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testTokens,
  testListingIds,
} = require("../tests/common")

beforeAll(commonBeforeAll)
beforeEach(commonBeforeEach)
afterEach(commonAfterEach)
afterAll(commonAfterAll)

/************************************** GET bookings/ */
describe("GET /bookings/", () => {
  test("Authed user can fetch all bookings they've made", async () => {
    const listingId = testListingIds[0]
    const res = await request(app).get(`/bookings`).set("authorization", `Bearer ${testTokens.jloToken}`)

    expect(res.statusCode).toEqual(200)

    const { bookings } = res.body
    expect(bookings.length).toEqual(2)

    const firstBooking = bookings[bookings.length - 1]

    firstBooking.totalCost = Number(firstBooking.totalCost)

    expect(firstBooking).toEqual({
      id: expect.any(Number),
      startDate: new Date("03-05-2021").toISOString(),
      endDate: new Date("03-07-2021").toISOString(),
      paymentMethod: "card",
      guests: 1,
      username: "jlo",
      hostUsername: "lebron",
      totalCost: expect.any(Number),
      listingId: listingId,
      userId: expect.any(Number),
      createdAt: expect.any(String),
    })
  })

  test("Throws Unauthorized error when user is unauthenticated", async () => {
    const res = await request(app).get(`/bookings/`)
    expect(res.statusCode).toEqual(401)
  })
})

/************************************** GET bookings/listings */
describe("GET /bookings/listings", () => {
  test("Authed user can fetch all bookings for any listings they own", async () => {
    const res = await request(app).get(`/bookings/listings`).set("authorization", `Bearer ${testTokens.lebronToken}`)

    expect(res.statusCode).toEqual(200)

    const { bookings } = res.body
    expect(bookings.length).toEqual(2)

    const firstBooking = bookings[bookings.length - 1]

    firstBooking.totalCost = Number(firstBooking.totalCost)

    expect(firstBooking).toEqual({
      id: expect.any(Number),
      startDate: new Date("03-05-2021").toISOString(),
      endDate: new Date("03-07-2021").toISOString(),
      paymentMethod: "card",
      guests: 1,
      username: "jlo",
      hostUsername: "lebron",
      totalCost: expect.any(Number),
      listingId: expect.any(Number),
      userId: expect.any(Number),
      createdAt: expect.any(String),
    })
  })

  test("Throws Unauthorized error when user is unauthenticated", async () => {
    const res = await request(app).get(`/bookings/listings`)
    expect(res.statusCode).toEqual(401)
  })
})

/************************************** POST bookings/listings/:listingId */
describe("POST bookings/listings/:listingId", () => {
  test("Authed user can book a listing they don't own.", async () => {
    // should select one of the listing ids from the testListingIds array.
    const listingId = testListingIds[0]
    // Create an object called data with a single newBooking property on it. 
    // Set that key equal to an object with the startDate, endDate, and guests properties on it.
    const data = { newBooking: { startDate: "06-06-2022", endDate: "06-12-2022", guests: 5 } }

    // should make a POST request to the /bookings/listings/:listingId route
    // make sure to set the authorization header on the post request using the jloToken
    // send the data object in that post request.
    const res = await request(app).post(`/bookings/listings/${listingId}`).set("authorization", `Bearer ${testTokens.jloToken}`).send(data)
    // Expect the response code to be 201
    expect(res.statusCode).toEqual(201)
    const { booking } = res.body
    booking.totalCost = Number(booking.totalCost)

    // check that the booking returned by that method is equal to an expected booking
    expect(booking).toEqual({
      id: expect.any(Number),
      startDate: new Date("06-06-2022").toISOString(),
      endDate: new Date("06-12-2022").toISOString(),
      paymentMethod: "card",
      guests: 5,
      username: "jlo",
      hostUsername: "lebron",
      totalCost: expect.any(Number),
      listingId: listingId,
      userId: expect.any(Number),
      createdAt: expect.any(String),
    })
  })

  test("Throws a Bad Request error when user attempts to book their own listing", async () => {
    // select the listingId with an index of 0 in the testListingIds array.
    const listingId = testListingIds[0]
    // Create an object called data with a single newBooking property on it. 
    // Set that key equal to an object with the startDate, endDate, and guests properties on it.
    const data = { newBooking: { startDate: "06-06-2022", endDate: "06-12-2022", guests: 5 } }

    // should make a POST request to the /bookings/listings/:listingId route. 
    // Make sure to set the authorization header on the post request using the lebronToken.
    // Send the data object in that post request.
    const res = await request(app).post(`/bookings/listings/${listingId}`).set("authorization", `Bearer ${testTokens.lebronToken}`).send(data)

    // Expect the response code to be 400
    expect(res.statusCode).toEqual(400)
  })
})

/************************************** GET bookings/listings/:listingId */
