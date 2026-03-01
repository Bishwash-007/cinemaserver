import * as paymentServices from '../services/paymentServices.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const result = await paymentServices.initiatePayment(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentServices.verifyPayment(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const getPaymentByBookingId = async (req, res, next) => {
  try {
    const result = await paymentServices.getPaymentByBookingId(
      req.user.id,
      Number(req.params.bookingId),
      req.user.role
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const result = await paymentServices.refundPayment(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
