const express = require("express");
const {
  addQueueReport,
  db,
  findUserById,
  getBehaviorByLocation,
  getBookingsByLocation,
  getLocationById,
  getReportsByLocation,
  upsertPrediction,
} = require("../data/store");
const { businessRequired } = require("../middleware/auth");
const { buildPrediction, queuePayloadToMetrics } = require("../services/predictionService");

const router = express.Router();

function hasManagedAccess(userId, locationId) {
  const user = findUserById(userId);
  return Boolean(user && (user.managedLocationIds || []).includes(Number(locationId)));
}

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

router.get("/business/dashboard/:locationId", businessRequired, (req, res) => {
  const location = getLocationById(req.params.locationId);
  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }
  if (!hasManagedAccess(req.user.userId, location.id)) {
    return res.status(403).json({
      error: "LOCATION_ACCESS_DENIED",
      message: "You do not manage this location",
    });
  }

  const context = buildContext();
  const reports = context.reportsByLocation.get(location.id) || [];
  const prediction = buildPrediction(location, reports, db.locations, context.reportsByLocation, context);
  upsertPrediction(prediction);

  const avgWait = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + report.waitMinutes, 0) / reports.length)
    : prediction.currentWaitMinutes;

  return res.json({
    locationId: location.id,
    name: location.name,
    currentWaitMinutes: prediction.currentWaitMinutes,
    crowdIndex: prediction.crowdIndex,
    avgWaitMinutes: avgWait,
    totalReports: reports.length,
    bookingsToday: (context.bookingsByLocation.get(location.id) || []).length,
    peakHour: `${location.hourlyLoad.indexOf(Math.max(...location.hourlyLoad)) + 8}:00`,
    recommendation: prediction.recommendation,
  });
});

router.get("/business/stats/:locationId", businessRequired, (req, res) => {
  const location = getLocationById(req.params.locationId);
  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }
  if (!hasManagedAccess(req.user.userId, location.id)) {
    return res.status(403).json({
      error: "LOCATION_ACCESS_DENIED",
      message: "You do not manage this location",
    });
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
    currentWaitMinutes: prediction.currentWaitMinutes,
    crowdIndex: prediction.crowdIndex,
    behavior: prediction.behavior,
    forecast: prediction.forecast,
  });
});

router.post("/business/queue/manual", businessRequired, (req, res) => {
  const { locationId, queueLevel } = req.body || {};
  const location = getLocationById(locationId);

  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }
  if (!hasManagedAccess(req.user.userId, location.id)) {
    return res.status(403).json({
      error: "LOCATION_ACCESS_DENIED",
      message: "You do not manage this location",
    });
  }

  if (!["none", "short", "medium", "long"].includes(queueLevel)) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "queueLevel must be one of: none, short, medium, long",
    });
  }

  const metrics = queuePayloadToMetrics(queueLevel);
  const report = addQueueReport({
    locationId: Number(locationId),
    userId: req.user.userId,
    queueLevel,
    waitMinutes: metrics.waitMinutes,
    peopleCount: metrics.peopleCount,
    source: "business",
    trustWeight: 1.55,
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
    prediction,
  });
});

router.get("/business/integration/:locationId", businessRequired, (req, res) => {
  const location = getLocationById(req.params.locationId);
  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }
  if (!hasManagedAccess(req.user.userId, location.id)) {
    return res.status(403).json({
      error: "LOCATION_ACCESS_DENIED",
      message: "You do not manage this location",
    });
  }

  return res.json({
    locationId: location.id,
    integrationKey: location.integrationKey,
    pushEndpoint: "/business/queue/manual",
    statsEndpoint: `/business/stats/${location.id}`,
    samplePayload: {
      locationId: location.id,
      queueLevel: "medium",
    },
  });
});

module.exports = router;
