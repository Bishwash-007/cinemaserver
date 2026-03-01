import * as reportServices from '../services/reportServices.js';

export const getDashboardOverview = async (_req, res, next) => {
  try {
    const data = await reportServices.getDashboardOverview();
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const { from, to, granularity } = req.query;
    const data = await reportServices.getRevenueReport({
      from,
      to,
      granularity,
    });
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getBookingsReport = async (req, res, next) => {
  try {
    const { from, to, granularity } = req.query;
    const data = await reportServices.getBookingsReport({
      from,
      to,
      granularity,
    });
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getMoviesReport = async (req, res, next) => {
  try {
    const { from, to, limit } = req.query;
    const data = await reportServices.getMoviesReport({
      from,
      to,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getOccupancyReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await reportServices.getOccupancyReport({ from, to });
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getUsersReport = async (req, res, next) => {
  try {
    const { from, to, granularity } = req.query;
    const data = await reportServices.getUsersReport({ from, to, granularity });
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const getDiscountsReport = async (_req, res, next) => {
  try {
    const data = await reportServices.getDiscountsReport();
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

// ─── Receipt ─────────────────────────────────────────────────────────────────

export const getReceipt = async (req, res, next) => {
  try {
    const bookingId = Number(req.params.id);
    const data = await reportServices.getReceipt(
      bookingId,
      req.user.id,
      req.user.role
    );
    res.json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
};

export const resendReceipt = async (req, res, next) => {
  try {
    const bookingId = Number(req.params.id);
    const result = await reportServices.sendReceiptEmail(
      bookingId,
      req.user.id,
      req.user.role
    );
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};
