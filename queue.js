const express = require("express");
const {
  addBehaviorEvent,
  addQueueReport,
  db,
  findUserById,
  getBehaviorByLocation,
  getBookingsByLocation,
  getLocationById,
  getReportsByLocation,
  updateUserStats,
  upsertPrediction,
} = require("../data/store");
const { authRequired } = require("../middleware/auth");
const { buildPrediction, queuePayloadToMetrics } = require("../services/predictionService");

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

router.post("/queue", authRequired, (req, res) => {
  const { locationId, queueLevel, passiveDetected = false } = req.body || {};
  const location = getLocationById(locationId);

  if (!location) {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Location not found",
    });
  }

  if (!["none", "short", "medium", "long"].includes(queueLevel)) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "queueLevel must be one of: none, short, medium, long",
    });
  }

  const user = findUserById(req.user.userId);
  const metrics = queuePayloadToMetrics(queueLevel);
  const trustWeight = 0.75 + ((user?.trustScore || 50) / 200);
  const report = addQueueReport({
    locationId: Number(locationId),
    userId: req.user.userId,
    queueLevel,
    waitMinutes: metrics.waitMinutes,
    peopleCount: metrics.peopleCount,
    passiveDetected: Boolean(passiveDetected),
    source: "user",
    trustWeight,
  });
  addBehaviorEvent({
    userId: req.user.userId,
    locationId: Number(locationId),
    type: "arrival",
  });

  const pointsAwarded = passiveDetected ? 12 : 10;
  const savedMinutes = Math.max(0, 15 - metrics.waitMinutes);
  const updatedUser = updateUserStats(req.user.userId, {
    updatesCountDelta: 1,
    pointsDelta: pointsAwarded,
    savedMinutesDelta: savedMinutes,
    trustDelta: 1,
  });

  const context = buildContext();
  const prediction = buildPrediction(
    location,
    context.reportsByLocation.get(location.id) || [],
    db.locations,
    context.reportsByLocation,
    context,
  );
  upsertPrediction(prediction);

  return res.status(201).json({
    report,
    pointsAwarded,
    user: updatedUser,
    prediction,
  });
});

module.exports = router;
