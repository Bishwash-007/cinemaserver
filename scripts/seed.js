import 'dotenv/config';
import bcrypt from 'bcryptjs';

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

const log = msg => console.log(`  \x1b[32m✔\x1b[0m  ${msg}`);
const step = msg => console.log(`\n\x1b[36m▶\x1b[0m  ${msg}`);

// Must match postgres enum definitions exactly
// cinema_booking_status: pending, confirmed, cancelled, failed
// cinema_payment_status: pending, completed, refunded, failed
// cinema_discount_type:  percentage, flat
// cinema_discount_scope: booking, ticket
// cinema_movie_status:   upcoming, released, archived

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
  // Hash once and reuse — bcrypt is expensive per call
  const hashedPassword = await bcrypt.hash('Password@123', 10);
  const users = createArray(10, idx => ({
    name: `${names[idx]} Sharma`,
    email: `user${idx + 1}@cinema.dev`,
    password: hashedPassword,
    role: idx === 0 ? 'admin' : 'user',
    age: 20 + idx,
    phoneNumber: `+977-98${String(10000000 + idx * 1111111).slice(0, 8)}`,
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
  const casts = createArray(10, idx => {
    // p.date() stores as 'YYYY-MM-DD' — pass a string, not a Date object
    const year = 1975 + idx;
    const month = String((idx % 12) + 1).padStart(2, '0');
    const day = String((idx % 28) + 1).padStart(2, '0');
    return {
      name: `Performer ${idx + 1}`,
      profileImageUrl: `https://cdn.cinema.dev/casts/${idx + 1}.jpg`,
      bio: `Award-winning performer. Bio ${idx + 1}.`,
      birthDate: `${year}-${month}-${day}`,
      nationality: ['Nepali', 'Indian', 'American'][idx % 3],
      socialMedia: {
        instagram: `https://instagram.com/performer${idx + 1}`,
        twitter: `https://twitter.com/performer${idx + 1}`,
      },
    };
  });
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
  const titles = [
    'Steel Horizon',
    'Monsoon Letters',
    'Lucky Chai',
    'The Pale Signal',
    'Orbit Zero',
    'Hidden Valley',
    'Broken Circuit',
    'The Last Festival',
    'Paper Temples',
    'Echo Protocol',
  ];
  // cinema_movie_status enum: 'upcoming' | 'released' | 'archived'
  const statuses = ['released', 'released', 'upcoming', 'archived'];
  const movies = createArray(10, idx => {
    // p.date() stores as 'YYYY-MM-DD' — pass a string, not a Date object
    const year = 2020 + (idx % 4);
    const month = String(((idx * 2) % 12) + 1).padStart(2, '0');
    const day = String((idx % 28) + 1).padStart(2, '0');
    return {
      title: titles[idx],
      slug: titles[idx].toLowerCase().replace(/\s+/g, '-'),
      description: `A compelling story — film ${idx + 1} with stunning visuals.`,
      releaseDate: `${year}-${month}-${day}`,
      durationInMinutes: 90 + idx * 8,
      language: ['Nepali', 'Hindi', 'English'][idx % 3],
      genre: genres[idx % genres.length],
      posterUrls: [`https://cdn.cinema.dev/posters/${idx + 1}.jpg`],
      backdropUrl: `https://cdn.cinema.dev/backdrops/${idx + 1}.jpg`,
      trailerUrl: `https://youtu.be/trailer-${idx + 1}`,
      rating: (6.0 + idx * 0.3).toFixed(1),
      imdbId: `tt${String(1000000 + idx).padStart(7, '0')}`,
      imdbRating: (6.2 + idx * 0.25).toFixed(1),
      letterboxdUrl: `https://boxd.it/movie-${idx + 1}`,
      tmdbId: 800000 + idx,
      status: statuses[idx % statuses.length],
      isAdult: idx % 7 === 0,
      director: `Director ${idx + 1}`,
    };
  });
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
    const start = new Date(Date.now() + idx * 4 * 3600 * 1000);
    const end = new Date(start.getTime() + (90 + idx * 8) * 60 * 1000);
    return {
      movieId: movies[idx % movies.length].id,
      screenId: screens[idx % screens.length].id,
      startTime: start,
      endTime: end,
      basePrice: (200 + idx * 50).toFixed(2), // NPR prices
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
  const codes = [
    'WELCOME10',
    'SAVE20',
    'FLAT50',
    'MONSOON15',
    'WEEKEND5',
    'IMAX20',
    'BOOKFEST',
    'STUDENT10',
    'DIWALI25',
    'NEWUSER30',
  ];
  const discounts = createArray(10, idx => ({
    code: codes[idx],
    description: `Promo code: ${codes[idx]}`,
    // cinema_discount_type enum: 'percentage' | 'flat'
    type: idx % 2 === 0 ? 'percentage' : 'flat',
    // cinema_discount_scope enum: 'booking' | 'ticket'
    scope: idx % 2 === 0 ? 'booking' : 'ticket',
    value: idx % 2 === 0 ? '10.00' : '50.00',
    minAmount: '200.00',
    maxDiscountAmount: '500.00',
    maxUsageCount: 100 + idx * 10,
    maxUsagePerUser: 2,
    usageCount: idx * 3,
    startsAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
    expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
    isStackable: idx % 5 === 0,
    isActive: idx % 7 !== 0,
    createdBy: users[0].id, // admin user
  }));
  return db.insert(discountCodesTable).values(discounts).returning();
}

async function seedBookings(users, showtimes) {
  const bookings = createArray(10, idx => ({
    userId: users[idx % users.length].id,
    showtimeId: showtimes[idx % showtimes.length].id,
    bookingNumber: `BK-${Date.now()}-${String(idx + 1).padStart(4, '0')}`,
    totalAmount: (400 + idx * 250).toFixed(2),
    // cinema_booking_status enum: 'pending' | 'confirmed' | 'cancelled' | 'failed'
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
  // previousStatus / newStatus must be valid cinema_booking_status enum values
  const transitions = [
    { previousStatus: 'pending', newStatus: 'confirmed' },
    { previousStatus: 'pending', newStatus: 'cancelled' },
    { previousStatus: 'confirmed', newStatus: 'cancelled' },
    { previousStatus: 'pending', newStatus: 'failed' },
    { previousStatus: 'confirmed', newStatus: 'failed' },
  ];
  const history = createArray(10, idx => {
    const t = transitions[idx % transitions.length];
    return {
      bookingId: bookings[idx % bookings.length].id,
      previousStatus: t.previousStatus,
      newStatus: t.newStatus,
      reason: `Transitioned from ${t.previousStatus} to ${t.newStatus}.`,
      actorId: users[0].id,
      metadata: { changedAt: new Date().toISOString(), source: 'seed' },
    };
  });
  return db.insert(bookingHistoryTable).values(history).returning();
}

async function seedBookingPayments(bookings) {
  const payments = createArray(10, idx => ({
    bookingId: bookings[idx % bookings.length].id,
    transactionId: `TXN-${Date.now()}-${String(idx + 1).padStart(4, '0')}`,
    amount: (400 + idx * 250).toFixed(2),
    provider: paymentProviders[idx % paymentProviders.length],
    // cinema_payment_status enum: 'pending' | 'completed' | 'refunded' | 'failed'
    paymentStatus: paymentStatuses[idx % paymentStatuses.length],
    paymentMetadata: {
      gateway: paymentProviders[idx % paymentProviders.length],
      ref: `pay-seed-${idx + 1}`,
    },
  }));
  return db.insert(bookingPaymentsTable).values(payments).returning();
}

async function seedBookingTickets(bookings, seats, showtimes) {
  // Group seats by screenId for fast lookup
  const seatsByScreen = seats.reduce((acc, seat) => {
    acc[seat.screenId] = acc[seat.screenId] ?? [];
    acc[seat.screenId].push(seat);
    return acc;
  }, {});
  // Unique constraint: (bookingId, seatId) — each booking (idx 0-9) is distinct
  const tickets = createArray(10, idx => {
    const booking = bookings[idx % bookings.length];
    const showtime = showtimes.find(st => st.id === booking.showtimeId);
    const pool = seatsByScreen[showtime.screenId] ?? seats;
    const seat = pool[idx % pool.length];
    const price = (
      parseFloat(showtime.basePrice ?? '200.00') *
      parseFloat(seat.priceMultiplier ?? '1.00')
    ).toFixed(2);
    return {
      bookingId: booking.id,
      seatId: seat.id,
      ticketNumber: `TK-${Date.now()}-${String(idx + 1).padStart(4, '0')}`,
      price,
      isCheckedIn: idx % 4 === 0,
    };
  });
  return db.insert(bookingTicketsTable).values(tickets).returning();
}

async function seedSeatLocks(showtimes, seats, users) {
  const seatsByScreen = seats.reduce((acc, seat) => {
    acc[seat.screenId] = acc[seat.screenId] ?? [];
    acc[seat.screenId].push(seat);
    return acc;
  }, {});
  // Unique constraint: (showtimeId, seatId) — offset by 1 to avoid ticket conflicts
  const locks = createArray(10, idx => {
    const showtime = showtimes[idx % showtimes.length];
    const pool = seatsByScreen[showtime.screenId] ?? seats;
    const seat = pool[(idx + 1) % pool.length];
    return {
      showtimeId: showtime.id,
      seatId: seat.id,
      userId: users[(idx + 1) % users.length].id,
      expiresAt: new Date(Date.now() + (10 + idx) * 60 * 1000),
    };
  });
  return db.insert(seatLocksTable).values(locks).returning();
}

async function seedAll() {
  const start = Date.now();

  step('Clearing all tables...');
  await clearTables();
  log('Tables cleared');

  step('Seeding users...');
  const users = await seedUsers();
  log(`${users.length} users  (password: Password@123)`);

  step('Seeding payment methods...');
  const methods = await seedPaymentMethods(users);
  log(`${methods.length} payment methods`);

  step('Seeding casts...');
  const casts = await seedCasts();
  log(`${casts.length} casts`);

  step('Seeding movies...');
  const movies = await seedMovies();
  log(`${movies.length} movies`);

  step('Seeding movie casts & reviews...');
  await seedMovieCasts(movies, casts);
  await seedReviews(movies, users);
  log('Done');

  step('Seeding theaters...');
  const theaters = await seedTheaters();
  log(`${theaters.length} theaters`);

  step('Seeding screens...');
  const screens = await seedScreens(theaters);
  log(`${screens.length} screens`);

  step('Seeding seats...');
  const seats = await seedSeats(screens);
  log(`${seats.length} seats`);

  step('Seeding showtimes...');
  const showtimes = await seedShowtimes(movies, screens);
  log(`${showtimes.length} showtimes`);

  step('Seeding discount codes...');
  const discountCodes = await seedDiscountCodes(users);
  log(`${discountCodes.length} discount codes`);

  step('Seeding bookings...');
  const bookings = await seedBookings(users, showtimes);
  log(`${bookings.length} bookings`);

  step('Seeding booking discounts, history, tickets & payments...');
  await seedBookingDiscounts(bookings, discountCodes);
  await seedBookingHistory(bookings, users);
  await seedBookingTickets(bookings, seats, showtimes);
  await seedBookingPayments(bookings);
  log('Done');

  step('Seeding seat locks...');
  await seedSeatLocks(showtimes, seats, users);
  log('Done');

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n\x1b[32m✔  Database seeded in ${elapsed}s\x1b[0m`);
  console.log('\n   Admin login: user1@cinema.dev / Password@123\n');
}

seedAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\x1b[31m✖  Seeding failed:\x1b[0m', err);
    process.exit(1);
  });
