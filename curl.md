# Cinema API — Complete API Reference

**Base URL:** `http://localhost:5500/api/v1`  
**Auth:** Bearer token in `Authorization` header **or** `token` cookie.

---

## Table of Contents

1. [Auth](#auth)
2. [Users (self)](#users)
3. [Movies (public)](#movies)
4. [Bookings (user)](#bookings)
5. [Payments (user)](#payments)
6. [Admin — Users](#admin--users)
7. [Admin — Movies, Theaters & Screens](#admin--movies-theaters--screens)
8. [Admin — Bookings & Discounts](#admin--bookings--discounts)
9. [Admin — Reports](#admin--reports)
10. [Error Responses](#error-responses)
11. [Route Summary](#route-summary)

---

## Auth

### Register

```bash
curl -X POST http://localhost:5500/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25,
    "phoneNumber": "+1234567890"
  }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

```bash
curl -X POST http://localhost:5500/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout

```bash
curl -X POST http://localhost:5500/api/v1/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{ "status": "success", "data": { "message": "Logged out successfully" } }
```

---

### Verify Email

```bash
curl -X POST http://localhost:5500/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{ "token": "abc123verificationtoken" }'
```

**Response `200`:**

```json
{ "status": "success", "data": { "message": "Email verified successfully" } }
```

---

### Forgot Password

```bash
curl -X POST http://localhost:5500/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "message": "If that email exists, a reset link has been sent",
    "resetToken": "xyz789resettoken"
  }
}
```

---

### Reset Password

```bash
curl -X POST http://localhost:5500/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "xyz789resettoken",
    "password": "newpassword123"
  }'
```

**Response `200`:**

```json
{ "status": "success", "data": { "message": "Password reset successfully" } }
```

---

## Users

### Get My Profile

```bash
curl http://localhost:5500/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "age": 25,
    "phoneNumber": "+1234567890",
    "profileImageUrl": null,
    "isVerified": true,
    "createdAt": "2026-03-01T00:00:00.000Z"
  }
}
```

---

### Update My Profile

```bash
curl -X PUT http://localhost:5500/api/v1/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "name": "John Updated", "age": 26, "phoneNumber": "+9876543210" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": { "id": 1, "name": "John Updated", "age": 26, "phoneNumber": "+9876543210" }
}
```

---

### Change Password

```bash
curl -X PUT http://localhost:5500/api/v1/users/me/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "currentPassword": "password123", "newPassword": "newpassword456" }'
```

**Response `200`:**

```json
{ "status": "success", "data": { "message": "Password changed successfully" } }
```

---

### Delete My Account

```bash
curl -X DELETE http://localhost:5500/api/v1/users/me \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{ "status": "success", "data": { "message": "Account deleted successfully" } }
```

---

## Movies

### List Movies

```bash
curl "http://localhost:5500/api/v1/movies?page=1&limit=20&status=released&language=English&search=avengers"
```

**Query Parameters:**

| Param      | Type   | Description                             |
| ---------- | ------ | --------------------------------------- |
| `page`     | number | Page number (default: 1)                |
| `limit`    | number | Items per page (default: 20, max: 100)  |
| `status`   | string | `upcoming` \| `released` \| `archived`  |
| `language` | string | Filter by language                      |
| `search`   | string | Search by title                         |

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "movies": [
      {
        "id": 1,
        "title": "Avengers Endgame",
        "slug": "avengers-endgame",
        "description": "The Avengers assemble...",
        "releaseDate": "2019-04-26",
        "duration": 181,
        "language": "English",
        "genre": ["action", "sci-fi"],
        "posterUrl": "https://...",
        "rating": "8.4",
        "status": "released",
        "director": "Russo Brothers",
        "isAdult": false
      }
    ],
    "page": 1,
    "limit": 20
  }
}
```

---

### Get Movie by ID

```bash
curl http://localhost:5500/api/v1/movies/1
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Avengers Endgame",
    "slug": "avengers-endgame",
    "releaseDate": "2019-04-26",
    "duration": 181,
    "language": "English",
    "genre": ["action", "sci-fi"],
    "posterUrl": "https://...",
    "backdropUrl": "https://...",
    "trailerUrl": "https://...",
    "rating": "8.4",
    "imdbId": "tt4154796",
    "imdbRating": "8.4",
    "status": "released",
    "isAdult": false,
    "director": "Russo Brothers"
  }
}
```

---

### Get Movie Reviews

```bash
curl "http://localhost:5500/api/v1/movies/1/reviews?page=1&limit=10"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": 1,
        "movieId": 1,
        "userId": 1,
        "rating": 9,
        "comment": "Amazing movie!",
        "createdAt": "2026-03-01T00:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10
  }
}
```

---

### Create Review _(Authenticated)_

```bash
curl -X POST http://localhost:5500/api/v1/movies/1/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "rating": 9, "comment": "Absolutely brilliant film!" }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": { "id": 1, "movieId": 1, "userId": 1, "rating": 9, "comment": "Absolutely brilliant film!" }
}
```

---

### Get Showtimes for Movie

```bash
curl http://localhost:5500/api/v1/movies/1/showtimes
```

**Response `200`:**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "movieId": 1,
      "screenId": 1,
      "startTime": "2026-03-10T14:00:00.000Z",
      "endTime": "2026-03-10T17:01:00.000Z",
      "basePrice": "500.00",
      "isActive": true
    }
  ]
}
```

---

### List Theaters

```bash
curl "http://localhost:5500/api/v1/movies/theaters?page=1&limit=20"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "theaters": [
      {
        "id": 1,
        "name": "QFX Cinemas",
        "location": "Civil Mall",
        "city": "Kathmandu",
        "address": "Sundhara, Kathmandu",
        "contactNumber": "+977-1-4444444",
        "amenities": ["parkingAvailable", "foodCourt"],
        "isActive": true
      }
    ],
    "page": 1,
    "limit": 20
  }
}
```

---

### Get Screen Seats

```bash
curl http://localhost:5500/api/v1/movies/screens/1/seats
```

**Response `200`:**

```json
{
  "status": "success",
  "data": [
    { "id": 1, "screenId": 1, "seatNumber": "A1", "rowName": "A", "columnNumber": 1, "seatType": "standard", "priceMultiplier": "1.00", "isAvailable": true },
    { "id": 2, "screenId": 1, "seatNumber": "A2", "rowName": "A", "columnNumber": 2, "seatType": "premium",  "priceMultiplier": "1.50", "isAvailable": true }
  ]
}
```

---

## Bookings

### Lock Seats _(Authenticated)_

Lock seats for 10 minutes before creating a booking.

```bash
curl -X POST http://localhost:5500/api/v1/bookings/seats/lock \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "showtimeId": 1, "seatIds": [1, 2] }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "locks": [
      { "id": 1, "showtimeId": 1, "seatId": 1, "userId": 1, "expiresAt": "2026-03-01T00:10:00.000Z" },
      { "id": 2, "showtimeId": 1, "seatId": 2, "userId": 1, "expiresAt": "2026-03-01T00:10:00.000Z" }
    ],
    "expiresAt": "2026-03-01T00:10:00.000Z"
  }
}
```

---

### Validate Discount Code _(Authenticated)_

```bash
curl -X POST http://localhost:5500/api/v1/bookings/discounts/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "code": "SAVE20", "totalAmount": 1000 }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "code": "SAVE20",
    "type": "percentage",
    "value": "20.00",
    "discountAmount": "200.00",
    "finalAmount": "800.00"
  }
}
```

---

### Create Booking _(Authenticated)_

```bash
curl -X POST http://localhost:5500/api/v1/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "showtimeId": 1,
    "seatIds": [1, 2],
    "discountCode": "SAVE20"
  }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": {
    "booking": {
      "id": 1,
      "userId": 1,
      "showtimeId": 1,
      "bookingNumber": "BK-1709251200000-ABCD1234",
      "totalAmount": "800.00",
      "bookingStatus": "pending",
      "createdAt": "2026-03-01T00:00:00.000Z"
    },
    "tickets": [
      { "id": 1, "bookingId": 1, "seatId": 1, "ticketNumber": "TK-1709251200000-EF012345", "price": "500.00", "isCheckedIn": false },
      { "id": 2, "bookingId": 1, "seatId": 2, "ticketNumber": "TK-1709251200001-GH678910", "price": "300.00", "isCheckedIn": false }
    ]
  }
}
```

---

### Get My Bookings _(Authenticated)_

```bash
curl "http://localhost:5500/api/v1/bookings/mine?page=1&limit=10&status=confirmed" \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "bookings": [
      { "id": 1, "bookingNumber": "BK-1709251200000-ABCD1234", "totalAmount": "800.00", "bookingStatus": "confirmed", "createdAt": "2026-03-01T00:00:00.000Z" }
    ],
    "page": 1,
    "limit": 10
  }
}
```

---

### Get Booking by ID _(Authenticated)_

```bash
curl http://localhost:5500/api/v1/bookings/1 \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "showtimeId": 1,
    "bookingNumber": "BK-1709251200000-ABCD1234",
    "totalAmount": "800.00",
    "bookingStatus": "confirmed",
    "createdAt": "2026-03-01T00:00:00.000Z",
    "tickets": [
      { "id": 1, "seatId": 1, "ticketNumber": "TK-1709251200000-EF012345", "price": "500.00", "isCheckedIn": false }
    ]
  }
}
```

---

### Cancel Booking _(Authenticated)_

```bash
curl -X PUT http://localhost:5500/api/v1/bookings/1/cancel \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Change of plans" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "bookingNumber": "BK-1709251200000-ABCD1234",
    "bookingStatus": "cancelled",
    "updatedAt": "2026-03-01T01:00:00.000Z"
  }
}
```

---

### Get Booking Receipt _(Authenticated)_

Returns the full receipt data as JSON (movie, showtime, theater, tickets, payment, discount).

```bash
curl http://localhost:5500/api/v1/bookings/1/receipt \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "booking": { "id": 1, "bookingNumber": "BK-1709251200000-ABCD1234", "totalAmount": "800.00", "bookingStatus": "confirmed" },
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "movie": { "id": 1, "title": "Inception", "duration": 148, "language": "English" },
    "showtime": { "id": 1, "startTime": "2026-03-10T14:00:00.000Z", "endTime": "2026-03-10T16:28:00.000Z", "basePrice": "500.00" },
    "theater": { "id": 1, "name": "QFX Cinemas", "city": "Kathmandu", "address": "Sundhara, Kathmandu" },
    "screen": { "id": 1, "name": "Screen 1", "screenType": "IMAX" },
    "tickets": [
      { "id": 1, "ticketNumber": "TK-1709251200000-EF012345", "seatNumber": "A1", "seatType": "standard", "price": "500.00", "isCheckedIn": false }
    ],
    "payment": { "id": 1, "transactionId": "STRIPE-...", "amount": "800.00", "provider": "stripe", "paymentStatus": "completed" },
    "discount": { "code": "SAVE20", "type": "percentage", "value": "20.00", "appliedAmount": "200.00" }
  }
}
```

---

### Resend Receipt Email _(Authenticated)_

Re-sends the booking confirmation email to the user's registered address.

```bash
curl -X POST http://localhost:5500/api/v1/bookings/1/receipt/resend \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": { "message": "Receipt sent to john@example.com" }
}
```

---

## Payments

### Initiate Payment _(Authenticated)_

```bash
curl -X POST http://localhost:5500/api/v1/payments/initiate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "bookingId": 1, "provider": "stripe" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "transactionId": "STRIPE-1709251200000-ABC123DEF456",
    "amount": "800.00",
    "provider": "stripe",
    "status": "pending",
    "paymentUrl": "https://pay.stripe.com/checkout/STRIPE-1709251200000-ABC123DEF456"
  }
}
```

---

### Verify Payment _(Authenticated)_

Payment verification also automatically sends a receipt email to the user.

```bash
curl -X POST http://localhost:5500/api/v1/payments/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": 1,
    "transactionId": "STRIPE-1709251200000-ABC123DEF456",
    "provider": "stripe",
    "providerPayload": { "paymentIntent": "pi_xyz", "signature": "whsec_abc" }
  }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "booking": { "id": 1, "bookingStatus": "confirmed", "updatedAt": "2026-03-01T00:05:00.000Z" },
    "payment": { "id": 1, "transactionId": "STRIPE-1709251200000-ABC123DEF456", "amount": "800.00", "provider": "stripe", "paymentStatus": "completed" }
  }
}
```

---

### Get Payments for Booking _(Authenticated)_

```bash
curl http://localhost:5500/api/v1/payments/1 \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "bookingId": 1,
    "payments": [
      { "id": 1, "transactionId": "STRIPE-1709251200000-ABC123DEF456", "amount": "800.00", "provider": "stripe", "paymentStatus": "completed", "createdAt": "2026-03-01T00:00:00.000Z" }
    ]
  }
}
```

---

### Refund Payment _(Authenticated)_

```bash
curl -X POST http://localhost:5500/api/v1/payments/refund \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "bookingId": 1, "reason": "Movie was cancelled" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "payment": { "id": 1, "paymentStatus": "refunded", "updatedAt": "2026-03-01T02:00:00.000Z" },
    "message": "Refund processed successfully"
  }
}
```

---

## Admin — Users

> All `/admin/*` routes require `Authorization: Bearer <admin_token>`.

### List All Users

```bash
curl http://localhost:5500/api/v1/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "users": [
      { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user", "isVerified": true, "createdAt": "2026-03-01T00:00:00.000Z" }
    ]
  }
}
```

---

### Update User Role

```bash
curl -X PUT http://localhost:5500/api/v1/admin/users/2/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "role": "admin" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": { "id": 2, "name": "Jane", "email": "jane@example.com", "role": "admin" }
}
```

---

## Admin — Movies, Theaters & Screens

### Create Movie

```bash
curl -X POST http://localhost:5500/api/v1/admin/movies \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "description": "A thief who steals corporate secrets...",
    "releaseDate": "2010-07-16",
    "duration": 148,
    "language": "English",
    "genre": ["sci-fi", "thriller"],
    "posterUrl": "https://example.com/inception-poster.jpg",
    "backdropUrl": "https://example.com/inception-backdrop.jpg",
    "trailerUrl": "https://youtube.com/watch?v=abc123",
    "imdbId": "tt1375666",
    "imdbRating": 8.8,
    "status": "released",
    "isAdult": false,
    "director": "Christopher Nolan"
  }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": { "id": 2, "title": "Inception", "slug": "inception", "status": "released", "createdAt": "2026-03-01T00:00:00.000Z" }
}
```

---

### Update Movie

```bash
curl -X PUT http://localhost:5500/api/v1/admin/movies/2 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "archived", "rating": "8.9" }'
```

**Response `200`:**

```json
{
  "status": "success",
  "data": { "id": 2, "title": "Inception", "status": "archived", "updatedAt": "2026-03-01T00:00:00.000Z" }
}
```

---

### Delete Movie

```bash
curl -X DELETE http://localhost:5500/api/v1/admin/movies/2 \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{ "status": "success", "data": { "message": "Movie deleted successfully" } }
```

---

### Create Showtime

```bash
curl -X POST http://localhost:5500/api/v1/admin/movies/showtimes \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 1,
    "screenId": 1,
    "startTime": "2026-03-10T14:00:00.000Z",
    "endTime": "2026-03-10T17:01:00.000Z",
    "basePrice": 500
  }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": { "id": 1, "movieId": 1, "screenId": 1, "startTime": "2026-03-10T14:00:00.000Z", "basePrice": "500.00", "isActive": true }
}
```

---

### Create Theater

```bash
curl -X POST http://localhost:5500/api/v1/admin/theaters \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QFX Cinemas",
    "location": "Civil Mall",
    "city": "Kathmandu",
    "address": "Sundhara, Kathmandu",
    "contactNumber": "+977-1-4444444",
    "amenities": ["parkingAvailable", "foodCourt"]
  }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": { "id": 1, "name": "QFX Cinemas", "city": "Kathmandu", "isActive": true, "createdAt": "2026-03-01T00:00:00.000Z" }
}
```

---

### Create Screen

```bash
curl -X POST http://localhost:5500/api/v1/admin/screens \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "theaterId": 1, "name": "Screen 1", "totalSeats": 150, "screenType": "IMAX" }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": { "id": 1, "theaterId": 1, "name": "Screen 1", "totalSeats": 150, "screenType": "IMAX" }
}
```

---

## Admin — Bookings & Discounts

### Get All Bookings

```bash
curl "http://localhost:5500/api/v1/admin/bookings?page=1&limit=20&status=pending" \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": { "bookings": [ /* booking objects */ ], "page": 1, "limit": 20 }
}
```

---

### Create Discount Code

```bash
curl -X POST http://localhost:5500/api/v1/admin/discounts \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "description": "20% off on all bookings",
    "type": "percentage",
    "scope": "booking",
    "value": 20,
    "minAmount": 500,
    "maxDiscountAmount": 300,
    "maxUsageCount": 100,
    "maxUsagePerUser": 1,
    "startsAt": "2026-03-01T00:00:00.000Z",
    "expiresAt": "2026-04-01T00:00:00.000Z",
    "isStackable": false
  }'
```

**Response `201`:**

```json
{
  "status": "success",
  "data": { "id": 1, "code": "SAVE20", "type": "percentage", "value": "20.00", "isActive": true, "createdAt": "2026-03-01T00:00:00.000Z" }
}
```

---

## Admin — Reports

All report routes accept optional `?from=<ISO>&to=<ISO>` date range parameters (default: last 30 days).  
Revenue, bookings, and user reports also accept `?granularity=day|week|month|year` (default: `day`).

### Dashboard Overview

```bash
curl http://localhost:5500/api/v1/admin/reports/overview \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "revenue": { "total": "125000.00", "thisMonth": "42000.00" },
    "bookings": { "total": "380", "thisMonth": "95", "pending": "12" },
    "avgOrderValue": "328.94",
    "totalUsers": "210",
    "topMovies": [
      { "id": 1, "title": "Inception", "ticketsSold": "120" }
    ]
  }
}
```

---

### Revenue Report

```bash
curl "http://localhost:5500/api/v1/admin/reports/revenue?from=2026-02-01&to=2026-03-01&granularity=week" \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "range": { "from": "2026-02-01T00:00:00.000Z", "to": "2026-03-01T00:00:00.000Z" },
    "summary": { "totalRevenue": "42000.00", "totalBookings": "95", "avgOrderValue": "442.10", "minOrderValue": "200.00", "maxOrderValue": "1500.00" },
    "trend": [
      { "period": "2026-02-01T00:00:00.000Z", "revenue": "9800.00", "bookings": "22", "ticketsSold": "40" }
    ],
    "byProvider": [
      { "provider": "stripe", "transactions": "80", "totalAmount": "38000.00" },
      { "provider": "esewa", "transactions": "15", "totalAmount": "4000.00" }
    ]
  }
}
```

---

### Bookings Report

```bash
curl "http://localhost:5500/api/v1/admin/reports/bookings?from=2026-02-01&to=2026-03-01" \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "range": { "from": "2026-02-01T00:00:00.000Z", "to": "2026-03-01T00:00:00.000Z" },
    "statusBreakdown": [
      { "status": "confirmed", "count": "78", "totalAmount": "38400.00" },
      { "status": "cancelled", "count": "10", "totalAmount": "4200.00" },
      { "status": "pending",   "count": "7",  "totalAmount": "2100.00" }
    ],
    "trend": [
      { "period": "2026-02-01T00:00:00.000Z", "total": "22", "confirmed": "18", "cancelled": "3", "pending": "1" }
    ]
  }
}
```

---

### Movie Performance Report

```bash
curl "http://localhost:5500/api/v1/admin/reports/movies?from=2026-02-01&to=2026-03-01&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "range": { "from": "2026-02-01T00:00:00.000Z", "to": "2026-03-01T00:00:00.000Z" },
    "movies": [
      { "movieId": 1, "title": "Inception", "slug": "inception", "totalBookings": "45", "ticketsSold": "78", "revenue": "34200.00" }
    ]
  }
}
```

---

### Occupancy Report

```bash
curl "http://localhost:5500/api/v1/admin/reports/occupancy?from=2026-02-01&to=2026-03-01" \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "range": { "from": "2026-02-01T00:00:00.000Z", "to": "2026-03-01T00:00:00.000Z" },
    "showtimes": [
      { "showtimeId": 1, "startTime": "2026-02-10T14:00:00.000Z", "movieTitle": "Inception", "theaterName": "QFX", "theaterCity": "Kathmandu", "screenName": "Screen 1", "screenType": "IMAX", "totalSeats": 150, "ticketsSold": "138", "occupancyRate": "92.0", "revenue": "69000.00" }
    ],
    "theaters": [
      { "theaterId": 1, "theaterName": "QFX Cinemas", "city": "Kathmandu", "totalShowtimes": "28", "totalBookings": "210", "ticketsSold": "380", "revenue": "124000.00" }
    ]
  }
}
```

---

### Users Report

```bash
curl "http://localhost:5500/api/v1/admin/reports/users?from=2026-02-01&to=2026-03-01&granularity=week" \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "range": { "from": "2026-02-01T00:00:00.000Z", "to": "2026-03-01T00:00:00.000Z" },
    "stats": { "total": "210", "verified": "185", "admins": "3", "deleted": "5" },
    "growth": [
      { "period": "2026-02-01T00:00:00.000Z", "newUsers": "18", "verifiedUsers": "15" }
    ],
    "topSpenders": [
      { "userId": 1, "name": "John Doe", "email": "john@example.com", "totalSpent": "4800.00", "totalBookings": "12" }
    ]
  }
}
```

---

### Discounts Report

```bash
curl http://localhost:5500/api/v1/admin/reports/discounts \
  -H "Authorization: Bearer <admin_token>"
```

**Response `200`:**

```json
{
  "status": "success",
  "data": {
    "codes": [
      { "id": 1, "code": "SAVE20", "type": "percentage", "value": "20.00", "isActive": true, "usageCount": 42, "maxUsageCount": 100, "totalDiscountGiven": "8400.00", "timesApplied": "42", "expiresAt": "2026-04-01T00:00:00.000Z" }
    ]
  }
}
```

---

## Error Responses

All errors follow this shape:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400,
  "details": {
    "fieldName": ["Validation error message"]
  }
}
```

| Status | Meaning                                          |
| ------ | ------------------------------------------------ |
| `400`  | Bad Request / Validation error                   |
| `401`  | Unauthorized — missing or invalid token          |
| `402`  | Payment Required — payment verification failed   |
| `403`  | Forbidden — insufficient permissions             |
| `404`  | Not Found                                        |
| `409`  | Conflict — resource already exists               |
| `422`  | Unprocessable Entity — schema validation failed  |
| `500`  | Internal Server Error                            |

---

## Route Summary

### Public

| Method | Endpoint                                   | Description           |
| ------ | ------------------------------------------ | --------------------- |
| `POST` | `/api/v1/auth/register`                    | Register              |
| `POST` | `/api/v1/auth/login`                       | Login                 |
| `POST` | `/api/v1/auth/logout`                      | Logout                |
| `POST` | `/api/v1/auth/verify-email`                | Verify email          |
| `POST` | `/api/v1/auth/forgot-password`             | Request password reset|
| `POST` | `/api/v1/auth/reset-password`              | Reset password        |
| `GET`  | `/api/v1/movies`                           | List movies           |
| `GET`  | `/api/v1/movies/:id`                       | Get movie             |
| `GET`  | `/api/v1/movies/:id/reviews`               | Get reviews           |
| `GET`  | `/api/v1/movies/:id/showtimes`             | Get showtimes         |
| `GET`  | `/api/v1/movies/theaters`                  | List theaters         |
| `GET`  | `/api/v1/movies/screens/:screenId/seats`   | Get seats             |

### Authenticated (any user)

| Method   | Endpoint                                | Description              |
| -------- | --------------------------------------- | ------------------------ |
| `GET`    | `/api/v1/users/me`                      | Get my profile           |
| `PUT`    | `/api/v1/users/me`                      | Update my profile        |
| `PUT`    | `/api/v1/users/me/password`             | Change password          |
| `DELETE` | `/api/v1/users/me`                      | Delete account           |
| `POST`   | `/api/v1/movies/:id/reviews`            | Create review            |
| `POST`   | `/api/v1/bookings/seats/lock`           | Lock seats (10 min)      |
| `POST`   | `/api/v1/bookings/discounts/validate`   | Validate discount code   |
| `POST`   | `/api/v1/bookings`                      | Create booking           |
| `GET`    | `/api/v1/bookings/mine`                 | My bookings              |
| `GET`    | `/api/v1/bookings/:id`                  | Get booking              |
| `PUT`    | `/api/v1/bookings/:id/cancel`           | Cancel booking           |
| `GET`    | `/api/v1/bookings/:id/receipt`          | Get receipt (JSON)       |
| `POST`   | `/api/v1/bookings/:id/receipt/resend`   | Resend receipt email     |
| `POST`   | `/api/v1/payments/initiate`             | Initiate payment         |
| `POST`   | `/api/v1/payments/verify`               | Verify payment + receipt |
| `GET`    | `/api/v1/payments/:bookingId`           | Get payments             |
| `POST`   | `/api/v1/payments/refund`               | Refund                   |

### Admin only (`/api/v1/admin/*`)

| Method   | Endpoint                               | Description             |
| -------- | -------------------------------------- | ----------------------- |
| `GET`    | `/api/v1/admin/users`                  | List all users          |
| `PUT`    | `/api/v1/admin/users/:id/role`         | Change user role        |
| `POST`   | `/api/v1/admin/movies`                 | Create movie            |
| `PUT`    | `/api/v1/admin/movies/:id`             | Update movie            |
| `DELETE` | `/api/v1/admin/movies/:id`             | Delete movie            |
| `POST`   | `/api/v1/admin/movies/showtimes`       | Create showtime         |
| `POST`   | `/api/v1/admin/theaters`               | Create theater          |
| `POST`   | `/api/v1/admin/screens`                | Create screen           |
| `GET`    | `/api/v1/admin/bookings`               | All bookings            |
| `POST`   | `/api/v1/admin/discounts`              | Create discount code    |
| `GET`    | `/api/v1/admin/reports/overview`       | Dashboard summary       |
| `GET`    | `/api/v1/admin/reports/revenue`        | Revenue report          |
| `GET`    | `/api/v1/admin/reports/bookings`       | Bookings report         |
| `GET`    | `/api/v1/admin/reports/movies`         | Movie performance       |
| `GET`    | `/api/v1/admin/reports/occupancy`      | Seat occupancy          |
| `GET`    | `/api/v1/admin/reports/users`          | User growth & spending  |
| `GET`    | `/api/v1/admin/reports/discounts`      | Discount usage          |

