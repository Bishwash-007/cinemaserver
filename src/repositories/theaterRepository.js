import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import {
  theatersTable,
  screensTable,
  seatsTable,
  showtimesTable,
} from '../models/theater.js';

export const findActiveTheaters = async ({ limit, offset }) =>
  db
    .select()
    .from(theatersTable)
    .where(eq(theatersTable.isActive, true))
    .limit(limit)
    .offset(offset);

export const createTheater = async data =>
  db
    .insert(theatersTable)
    .values(data)
    .returning()
    .then(([row]) => row);

export const createScreen = async data =>
  db
    .insert(screensTable)
    .values(data)
    .returning()
    .then(([row]) => row);

export const findSeatsByScreen = async screenId =>
  db.select().from(seatsTable).where(eq(seatsTable.screenId, screenId));

export const findShowtimesByMovie = async movieId =>
  db
    .select()
    .from(showtimesTable)
    .where(
      and(
        eq(showtimesTable.movieId, movieId),
        eq(showtimesTable.isActive, true)
      )
    );

export const findShowtimeById = async id =>
  db
    .select()
    .from(showtimesTable)
    .where(and(eq(showtimesTable.id, id), eq(showtimesTable.isActive, true)))
    .then(([row]) => row ?? null);

export const createShowtime = async data =>
  db
    .insert(showtimesTable)
    .values(data)
    .returning()
    .then(([row]) => row);
