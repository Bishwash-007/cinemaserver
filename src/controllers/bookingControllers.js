import * as bookingServices from '../services/bookingServices.js';

export const createBooking = async (req, res, next) => {
  try {
    const result = await bookingServices.createBooking(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingServices.cancelBooking(
      req.user.id,
      Number(req.params.id),
      req.body
    );
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingServices.getBookingById(
      req.user.id,
      Number(req.params.id),
      req.user.role
    );
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingServices.getUserBookings(
      req.user.id,
      req.query
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const result = await bookingServices.getAllBookings(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const validateDiscount = async (req, res, next) => {
  try {
    const { code, totalAmount } = req.body;
    const result = await bookingServices.validateDiscount(
      code,
      Number(totalAmount)
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const createDiscountCode = async (req, res, next) => {
  try {
    const discount = await bookingServices.createDiscountCode(
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, data: discount });
  } catch (err) {
    next(err);
  }
};

export const lockSeats = async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const result = await bookingServices.lockSeats(
      req.user.id,
      showtimeId,
      seatIds
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};


export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookingStatus, reason } = req.body;
    const updated = await bookingServices.updateBookingStatus(
      req.user.id,
      Number(id),
      bookingStatus,
      reason,
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};