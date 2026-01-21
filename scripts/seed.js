import 'dotenv/config';

import {
  bookingDiscountsTable,
  bookingHistoryTable,
  bookingPaymentsTable,
  bookingTicketsTable,
  bookingsTable,
  castsTable,
  discountCodesTable,
  movieCastsTable,
  moviesTable,
  paymentMethodsTable,
  reviewsTable,
  seatLocksTable,
  seatsTable,
  screensTable,
  showtimesTable,
  theatersTable,
  usersTable,
} from '../src/models/schema.js';
import { db } from '../src/config/db.js';

const createArray = (size, factory) =>
  Array.from({ length: size }, (_, idx) => factory(idx));
const cities = [
  'Kathmandu',
  'Pokhara',
  'Lalitpur',
  'Biratnagar',
  'Birgunj',
  'Itahari',
  'Butwal',
  'Dharan',
  'Janakpur',
  'Hetauda',
];
const screenTypes = ['2D', '3D', 'IMAX', '4DX'];
const seatTypes = ['standard', 'premium', 'vip'];
const paymentProviders = ['stripe', 'khalti', 'esewa'];
const bookingStatuses = ['pending', 'confirmed', 'cancelled', 'failed'];
const paymentStatuses = ['pending', 'completed', 'refunded', 'failed'];

async function clearTables() {
  await db.delete(seatLocksTable);
  await db.delete(bookingPaymentsTable);
  await db.delete(bookingTicketsTable);
  await db.delete(bookingHistoryTable);
  await db.delete(bookingDiscountsTable);
  await db.delete(bookingsTable);
  await db.delete(discountCodesTable);
  await db.delete(showtimesTable);
  await db.delete(seatsTable);
  await db.delete(screensTable);
  await db.delete(theatersTable);
  await db.delete(movieCastsTable);
  await db.delete(reviewsTable);
  await db.delete(moviesTable);
  await db.delete(castsTable);
  await db.delete(paymentMethodsTable);
  await db.delete(usersTable);
}

async function seedUsers() {
  const names = [
    'Aarav',
    'Sita',
    'Kiran',
    'Maya',
    'Nabin',
    'Asha',
    'Prakash',
    'Lina',
    'Kushal',
    'Bina',
  ];
  const users = createArray(10, idx => ({
    name: `${names[idx]} Sharma`,
    email: `user${idx + 1}@cinema.dev`,
    password: `hashed-password-${idx + 1}`,
    role: idx === 0 ? 'admin' : 'user',
    isVerified: idx % 2 === 0,
    verificationToken: null,
    resetPasswordToken: null,
  }));
  return db.insert(usersTable).values(users).returning();
}

async function seedPaymentMethods(users) {
  const cards = ['Visa', 'Mastercard', 'Amex'];
  const methods = createArray(10, idx => {
    const user = users[idx % users.length];
    return {
      userId: user.id,
      provider: paymentProviders[idx % paymentProviders.length],
      externalMethodId: `pm_${user.id}_${idx + 1}`,
      last4: String(1111 + idx).slice(-4),
      expiryMonth: (idx % 12) + 1,
      expiryYear: 2030 + (idx % 5),
      brand: cards[idx % cards.length],
      isDefault: idx % 3 === 0,
    };
  });
  return db.insert(paymentMethodsTable).values(methods).returning();
}

async function seedCasts() {
  const casts = createArray(10, idx => ({
    name: `Performer ${idx + 1}`,
    profileImageUrl: `https://cdn.cinema.dev/casts/${idx + 1}.jpg`,
    bio: `Bio for performer ${idx + 1}.`,
    birthDate: new Date(1980 + idx, idx % 12, (idx % 28) + 1),
    nationality: 'Nepalese',
    socialMedia: { instagram: `https://instagram.com/performer${idx + 1}` },
  }));
  return db.insert(castsTable).values(casts).returning();
}

async function seedMovies() {
  const genres = [
    ['Action', 'Adventure'],
    ['Drama', 'Romance'],
    ['Comedy', 'Family'],
    ['Thriller', 'Mystery'],
    ['Sci-Fi', 'Fantasy'],
  ];
  const movies = createArray(10, idx => ({
    title: `Sample Movie ${idx + 1}`,
    slug: `sample-movie-${idx + 1}`,
    description: `Synopsis for Sample Movie ${idx + 1}.`,
    releaseDate: new Date(2020 + (idx % 4), (idx * 2) % 12, (idx % 28) + 1),
    durationInMinutes: 100 + idx * 5,
    language: idx % 2 === 0 ? 'Nepali' : 'English',
    genre: genres[idx % genres.length],
    posterUrls: [`https://cdn.cinema.dev/posters/${idx + 1}.jpg`],
    backdropUrl: `https://cdn.cinema.dev/backdrops/${idx + 1}.jpg`,
    trailerUrl: `https://youtu.be/trailer-${idx + 1}`,
    rating: (6.5 + idx * 0.2).toFixed(1),
    imdbId: `tt00000${idx + 1}`,
    imdbRating: (6.5 + idx * 0.3).toFixed(1),
    letterboxdUrl: `https://boxd.it/movie-${idx + 1}`,
    tmdbId: 1000 + idx,
    status: idx % 3 === 0 ? 'released' : 'upcoming',
    isAdult: idx % 7 === 0,
    director: `Director ${idx + 1}`,
  }));
  return db.insert(moviesTable).values(movies).returning();
}

async function seedMovieCasts(movies, casts) {
  const links = createArray(10, idx => ({
    movieId: movies[idx % movies.length].id,
    castId: casts[(idx + 2) % casts.length].id,
    characterName: `Character ${idx + 1}`,
    billingOrder: idx,
  }));
  return db.insert(movieCastsTable).values(links).returning();
}

async function seedTheaters() {
  const theaters = createArray(10, idx => ({
    name: `Downtown Cinema ${idx + 1}`,
    location: `Block ${idx + 1}`,
    city: cities[idx],
    address: `${idx + 10} Main Street, ${cities[idx]}`,
    contactNumber: `+977-1-555-55${String(idx).padStart(2, '0')}`,
    amenities: idx % 2 === 0 ? ['Dolby Atmos', 'Recliners'] : ['4K Projector'],
    isActive: true,
  }));
  return db.insert(theatersTable).values(theaters).returning();
}

async function seedScreens(theaters) {
  const screens = createArray(10, idx => ({
    theaterId: theaters[idx % theaters.length].id,
    name: `Screen ${idx + 1}`,
    totalSeats: 120 + idx * 5,
    screenType: screenTypes[idx % screenTypes.length],
  }));
  return db.insert(screensTable).values(screens).returning();
}

async function seedSeats(screens) {
  const seats = createArray(30, idx => {
    const screen = screens[idx % screens.length];
    const rowName = String.fromCharCode(65 + (idx % 6));
    const columnNumber = (idx % 10) + 1;
    return {
      screenId: screen.id,
      seatNumber: `${rowName}${columnNumber}`,
      rowName,
      columnNumber,
      seatType: seatTypes[idx % seatTypes.length],
      priceMultiplier: (1 + (idx % 3) * 0.1).toFixed(2),
      isAvailable: true,
    };
  });
  return db.insert(seatsTable).values(seats).returning();
}

async function seedShowtimes(movies, screens) {
  const showtimes = createArray(10, idx => {
    const start = new Date(Date.now() + idx * 3600 * 1000);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    return {
      movieId: movies[idx % movies.length].id,
      screenId: screens[idx % screens.length].id,
      startTime: start,
      endTime: end,
      basePrice: (8 + idx).toFixed(2),
      isActive: idx % 5 !== 0,
    };
  });
  return db.insert(showtimesTable).values(showtimes).returning();
}

async function seedReviews(movies, users) {
  const reviews = createArray(10, idx => ({
    movieId: movies[idx % movies.length].id,
    userId: users[(idx + 3) % users.length].id,
    rating: (idx % 5) + 1,
    comment: `Review ${idx + 1} for movie ${movies[idx % movies.length].title}.`,
  }));
  return db.insert(reviewsTable).values(reviews).returning();
}

async function seedDiscountCodes(users) {
  const discounts = createArray(10, idx => ({
    code: `DISC-${idx + 1}`,
    description: `Discount code ${idx + 1}.`,
    type: idx % 2 === 0 ? 'percentage' : 'flat',
    scope: idx % 3 === 0 ? 'ticket' : 'booking',
    value: idx % 2 === 0 ? '10.00' : '5.00',
    minAmount: '20.00',
    maxDiscountAmount: '15.00',
    maxUsageCount: 100,
    maxUsagePerUser: 5,
    usageCount: 0,
    startsAt: new Date(Date.now() - 24 * 3600 * 1000),
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    isStackable: idx % 4 === 0,
    isActive: true,
    createdBy: users[idx % users.length].id,
  }));
  return db.insert(discountCodesTable).values(discounts).returning();
}

async function seedBookings(users, showtimes) {
  const bookings = createArray(10, idx => ({
    userId: users[idx % users.length].id,
    showtimeId: showtimes[idx % showtimes.length].id,
    bookingNumber: `BOOK-${String(idx + 1).padStart(4, '0')}`,
    totalAmount: (25 + idx * 2).toFixed(2),
    bookingStatus: bookingStatuses[idx % bookingStatuses.length],
  }));
  return db.insert(bookingsTable).values(bookings).returning();
}

async function seedBookingDiscounts(bookings, discountCodes) {
  const records = createArray(10, idx => ({
    bookingId: bookings[idx % bookings.length].id,
    discountCodeId: discountCodes[idx % discountCodes.length].id,
    appliedAmount: (idx + 1).toFixed(2),
    metadata: { stacked: idx % 4 === 0 },
  }));
  return db.insert(bookingDiscountsTable).values(records).returning();
}

async function seedBookingHistory(bookings, users) {
  const history = createArray(10, idx => ({
    bookingId: bookings[idx % bookings.length].id,
    previousStatus: idx % 2 === 0 ? 'pending' : 'confirmed',
    newStatus: idx % 2 === 0 ? 'confirmed' : 'cancelled',
    reason: `Status update ${idx + 1}.`,
    actorId: users[0].id,
    metadata: { note: `Change initiated by admin for record ${idx + 1}` },
  }));
  return db.insert(bookingHistoryTable).values(history).returning();
}

async function seedBookingPayments(bookings) {
  const payments = createArray(10, idx => ({
    bookingId: bookings[idx % bookings.length].id,
    transactionId: `txn_${idx + 1}_${Date.now()}`,
    amount: (25 + idx * 2).toFixed(2),
    provider: paymentProviders[idx % paymentProviders.length],
    paymentStatus: paymentStatuses[idx % paymentStatuses.length],
    paymentMetadata: { reference: `pay-${idx + 1}` },
  }));
  return db.insert(bookingPaymentsTable).values(payments).returning();
}

async function seedBookingTickets(bookings, seats, showtimes) {
  const seatsByScreen = seats.reduce((acc, seat) => {
    acc[seat.screenId] = acc[seat.screenId] || [];
    acc[seat.screenId].push(seat);
    return acc;
  }, {});
  const tickets = createArray(10, idx => {
    const booking = bookings[idx % bookings.length];
    const relatedShowtime = showtimes.find(
      item => item.id === booking.showtimeId
    );
    const seatPool = seatsByScreen[relatedShowtime.screenId] || seats;
    const seat = seatPool[idx % seatPool.length];
    return {
      bookingId: booking.id,
      seatId: seat.id,
      ticketNumber: `TKT-${String(idx + 1).padStart(4, '0')}`,
      price: relatedShowtime.basePrice || '10.00',
      isCheckedIn: idx % 3 === 0,
    };
  });
  return db.insert(bookingTicketsTable).values(tickets).returning();
}

async function seedSeatLocks(showtimes, seats, users) {
  const seatsByScreen = seats.reduce((acc, seat) => {
    acc[seat.screenId] = acc[seat.screenId] || [];
    acc[seat.screenId].push(seat);
    return acc;
  }, {});
  const locks = createArray(10, idx => {
    const showtime = showtimes[idx % showtimes.length];
    const seatPool = seatsByScreen[showtime.screenId] || seats;
    const seat = seatPool[(idx + 2) % seatPool.length];
    return {
      showtimeId: showtime.id,
      seatId: seat.id,
      userId: users[(idx + 1) % users.length].id,
      expiresAt: new Date(Date.now() + (idx + 10) * 60000),
    };
  });
  return db.insert(seatLocksTable).values(locks).returning();
}

async function seedAll() {
  await clearTables();

  const users = await seedUsers();
  await seedPaymentMethods(users);

  const casts = await seedCasts();
  const movies = await seedMovies();
  await seedMovieCasts(movies, casts);
  await seedReviews(movies, users);

  const theaters = await seedTheaters();
  const screens = await seedScreens(theaters);
  const seats = await seedSeats(screens);
  const showtimes = await seedShowtimes(movies, screens);

  const discountCodes = await seedDiscountCodes(users);
  const bookings = await seedBookings(users, showtimes);
  await seedBookingDiscounts(bookings, discountCodes);
  await seedBookingHistory(bookings, users);
  await seedBookingTickets(bookings, seats, showtimes);
  await seedBookingPayments(bookings);
  await seedSeatLocks(showtimes, seats, users);
}

seedAll()
  .then(() => {
    console.log('Database seeded with sample data.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
