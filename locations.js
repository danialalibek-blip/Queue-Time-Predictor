const express = require("express");
const {
  db,
  getBehaviorByLocation,
  getBookingsByLocation,
  getLocationById,
  getReportsByLocation,
  upsertPrediction,
} = require("../data/store");
const { buildPrediction } = require("../services/predictionService");

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

function buildLocationSummary(location, prediction) {
  return {
    id: location.id,
    name: location.name,
    address: location.address,
    category: location.category,
    distanceKm: location.distanceKm,
    lat: location.lat,
    lng: location.lng,
    workingHours: location.workingHours,
    currentWaitMinutes: prediction.currentWaitMinutes,
    crowdIndex: prediction.crowdIndex,
    bestVisitTime: prediction.bestVisitTime,
    recommendation: prediction.recommendation,
    behavior: prediction.behavior,
    updatedAgo: prediction.updatedAgo,
  };
}

router.get("/locations", (req, res) => {
  const category = req.query.category || "all";
  const sort = req.query.sort || "wait";
  const context = buildContext();

  const items = db.locations
    .filter((location) => category === "all" || location.category === category)
    .map((location) => {
      const prediction = buildPrediction(
        location,
        context.reportsByLocation.get(location.id) || [],
        db.locations,
        context.reportsByLocation,
        context,
      );
      upsertPrediction(prediction);
      return buildLocationSummary(location, prediction);
    });

  items.sort((left, right) => {
    if (sort === "distance") {
      return left.distanceKm - right.distanceKm;
    }
    if (sort === "crowd") {
      return left.crowdIndex - right.crowdIndex;
    }
    return left.currentWaitMinutes - right.currentWaitMinutes;
  });

  return res.json({
    total: items.length,
    items,
  });
});

router.get("/locations/:id", (req, res) => {
  const location = getLocationById(req.params.id);
  if (!location) {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Location not found",
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
  upsertPrediction(prediction);

  return res.json({
    ...location,
    live: prediction,
  });
});

router.get("/predictions/:locationId", (req, res) => {
  const location = getLocationById(req.params.locationId);
  if (!location) {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Location not found",
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
  upsertPrediction(prediction);

  return res.json(prediction);
});

router.get("/heatmap/city", (_req, res) => {
  const context = buildContext();
  const hotspots = db.locations
    .map((location) => {
      const prediction = buildPrediction(
        location,
        context.reportsByLocation.get(location.id) || [],
        db.locations,
        context.reportsByLocation,
        context,
      );
      return {
        locationId: location.id,
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        crowdIndex: prediction.crowdIndex,
        queueLevel: prediction.currentQueueLevel,
      };
    })
    .sort((left, right) => right.crowdIndex - left.crowdIndex);

  return res.json({
    city: "Almaty",
    hotspots,
  });
});

module.exports = router;
