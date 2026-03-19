const express = require("express");
const { addBehaviorEvent, getLocationById } = require("../data/store");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/signals/intent", authRequired, (req, res) => {
  const { locationId, type = "view" } = req.body || {};
  const location = getLocationById(locationId);
  if (!location) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Location not found" });
  }

  if (!["view", "arrival", "booking"].includes(type)) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "type must be one of: view, arrival, booking",
    });
  }

  const event = addBehaviorEvent({
    userId: req.user.userId,
    locationId: Number(locationId),
    type,
  });

  return res.status(201).json({ event });
});

module.exports = router;
