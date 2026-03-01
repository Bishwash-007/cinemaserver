import * as movieServices from '../services/movieServices.js';

export const getMovies = async (req, res, next) => {
  try {
    const result = await movieServices.getMovies(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = await movieServices.getMovieById(Number(req.params.id));
    res.status(200).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const movie = await movieServices.createMovie(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await movieServices.updateMovie(
      Number(req.params.id),
      req.body
    );
    res.status(200).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const result = await movieServices.deleteMovie(Number(req.params.id));
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getMovieReviews = async (req, res, next) => {
  try {
    const result = await movieServices.getMovieReviews(
      Number(req.params.id),
      req.query
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const review = await movieServices.createReview(
      Number(req.params.id),
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getShowtimes = async (req, res, next) => {
  try {
    const showtimes = await movieServices.getShowtimes(Number(req.params.id));
    res.status(200).json({ success: true, data: showtimes });
  } catch (err) {
    next(err);
  }
};

export const createShowtime = async (req, res, next) => {
  try {
    const showtime = await movieServices.createShowtime(req.body);
    res.status(201).json({ success: true, data: showtime });
  } catch (err) {
    next(err);
  }
};

export const getTheaters = async (req, res, next) => {
  try {
    const result = await movieServices.getTheaters(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const createTheater = async (req, res, next) => {
  try {
    const theater = await movieServices.createTheater(req.body);
    res.status(201).json({ success: true, data: theater });
  } catch (err) {
    next(err);
  }
};

export const createScreen = async (req, res, next) => {
  try {
    const screen = await movieServices.createScreen(req.body);
    res.status(201).json({ success: true, data: screen });
  } catch (err) {
    next(err);
  }
};

export const getScreenSeats = async (req, res, next) => {
  try {
    const seats = await movieServices.getScreenSeats(
      Number(req.params.screenId)
    );
    res.status(200).json({ success: true, data: seats });
  } catch (err) {
    next(err);
  }
};
