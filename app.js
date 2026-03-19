const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const businessRoutes = require("./routes/business");
const locationRoutes = require("./routes/locations");
const queueRoutes = require("./routes/queue");
const referralRoutes = require("./routes/referrals");
const signalRoutes = require("./routes/signals");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Queue Time Predictor API",
    status: "ok",
    version: "0.1.0",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use(bookingRoutes);
app.use(businessRoutes);
app.use(locationRoutes);
app.use(queueRoutes);
app.use(referralRoutes);
app.use(signalRoutes);

module.exports = app;
