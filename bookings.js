const express = require("express");
const {
  addBehaviorEvent,
  addBooking,
  db,
  getBehaviorByLocation,
  getBookingsByLocation,
  getBookingsByUser,
  getLocationById,
  getReportsByLocation,
} = require("../data/store");
const { authRequired } = require("../middleware/auth");
const { buildPrediction, buildSuggestedSlots } = require("../services/predictionService");

const router = express.Router();

function buildContext() {
  const reportsByLocation = new Map();
  const behaviorByLocation = new Map();
  const bookingsByLocation = new Map();

  for (const location of db.locations) {
    reportsByLocation.set(location.id, getReportsByLocation(location.id));
    behaviorByLocation.set(location.id, getBehaviorByLocation(location.id));
    bookingsByLocation.set(location.id, getBookingsByLocation(location.id));
  }

  return { reportsByLocation, behaviorByLocation, bookingsByLocation };
}

router.get("/bookings/suggest/:locationId", (req, res) => {
  const location = getLocationById(req.params.locationId);
  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }

  const context = buildContext();
  const prediction = buildPrediction(
    location,
    context.reportsByLocation.get(location.id) || [],
    db.locations,
    context.reportsByLocation,
    context,
  );

  return res.json({
    locationId: location.id,
    slots: buildSuggestedSlots(prediction),
  });
});

router.post("/bookings", authRequired, (req, res) => {
  const { locationId, scheduledFor, predictedWaitMinutes = 0 } = req.body || {};
  const location = getLocationById(locationId);
  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }

  const booking = addBooking({
    userId: req.user.userId,
    locationId: Number(locationId),
    scheduledFor,
    predictedWaitMinutes,
  });
  addBehaviorEvent({
    userId: req.user.userId,
    locationId: Number(locationId),
    type: "booking",
  });

  return res.status(201).json({ booking });
});

router.get("/bookings/me", authRequired, (req, res) => {
  return res.json({
    items: getBookingsByUser(req.user.userId),
  });
});

module.exports = router;
