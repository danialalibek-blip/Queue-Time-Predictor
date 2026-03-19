const { hashPassword } = require("../utils/password");

const now = new Date();

function minutesAgo(minutes) {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

const users = [
  {
    id: 1,
    name: "Asel Demo",
    email: "demo@queue.ai",
    passwordHash: hashPassword("demo123"),
    provider: "email",
    role: "business_admin",
    reputationPoints: 340,
    trustScore: 78,
    updatesCount: 47,
    streakDays: 7,
    savedMinutes: 146,
    invitedFriends: 6,
    referralBonuses: 150,
    referralCode: "ASEL25",
    managedLocationIds: [1, 4],
    createdAt: minutesAgo(60 * 24 * 10),
  },
];

const locations = [
  {
    id: 1,
    name: "North Line Branch",
    address: "пр. Аль-Фараби, 77А",
    category: "bank",
    branchGroup: "civic_bank",
    distanceKm: 0.3,
    lat: 43.238,
    lng: 76.889,
    workingHours: "08:00-20:00",
    integrationKey: "bank_civic_001",
    hourlyLoad: [10, 14, 8, 5, 18, 20, 12, 7, 4, 3, 5, 10],
  },
  {
    id: 2,
    name: "Central Service Branch",
    address: "ул. Байзакова, 280",
    category: "bank",
    branchGroup: "service_bank",
    distanceKm: 1.5,
    lat: 43.225,
    lng: 76.87,
    workingHours: "09:00-19:00",
    integrationKey: "bank_service_002",
    hourlyLoad: [6, 9, 7, 5, 4, 3, 5, 8, 10, 9, 6, 4],
  },
  {
    id: 3,
    name: "Polyclinic #7",
    address: "ул. Тимирязева, 42",
    category: "hospital",
    branchGroup: "clinic",
    distanceKm: 0.8,
    lat: 43.248,
    lng: 76.895,
    workingHours: "08:00-18:00",
    integrationKey: "clinic_007",
    hourlyLoad: [20, 28, 25, 16, 13, 9, 11, 15, 22, 24, 20, 14],
  },
  {
    id: 4,
    name: "ЦОН Медеуский",
    address: "ул. Желтоксан, 128",
    category: "gov",
    branchGroup: "csc",
    distanceKm: 1.2,
    lat: 43.23,
    lng: 76.878,
    workingHours: "09:00-18:00",
    integrationKey: "gov_csc_medeu",
    hourlyLoad: [32, 44, 40, 28, 22, 16, 24, 38, 46, 40, 32, 22],
  },
  {
    id: 5,
    name: "Magnum Market",
    address: "пр. Независимости, 55",
    category: "shop",
    branchGroup: "magnum",
    distanceKm: 1.7,
    lat: 43.255,
    lng: 76.86,
    workingHours: "24/7",
    integrationKey: "shop_magnum_055",
    hourlyLoad: [8, 7, 6, 12, 22, 20, 16, 22, 28, 20, 14, 10],
  },
];

const queueReports = [
  {
    id: 1,
    locationId: 1,
    userId: 1,
    queueLevel: "none",
    waitMinutes: 3,
    peopleCount: 1,
    passiveDetected: true,
    source: "user",
    trustWeight: 1.18,
    createdAt: minutesAgo(5),
  },
  {
    id: 2,
    locationId: 1,
    userId: 1,
    queueLevel: "short",
    waitMinutes: 6,
    peopleCount: 3,
    passiveDetected: true,
    source: "user",
    trustWeight: 1.18,
    createdAt: minutesAgo(24),
  },
  {
    id: 3,
    locationId: 2,
    userId: 1,
    queueLevel: "none",
    waitMinutes: 2,
    peopleCount: 1,
    passiveDetected: false,
    source: "business",
    trustWeight: 1.55,
    createdAt: minutesAgo(4),
  },
  {
    id: 4,
    locationId: 3,
    userId: 1,
    queueLevel: "medium",
    waitMinutes: 18,
    peopleCount: 12,
    passiveDetected: true,
    source: "user",
    trustWeight: 1.18,
    createdAt: minutesAgo(11),
  },
  {
    id: 5,
    locationId: 3,
    userId: 1,
    queueLevel: "medium",
    waitMinutes: 15,
    peopleCount: 9,
    passiveDetected: false,
    source: "user",
    trustWeight: 1.18,
    createdAt: minutesAgo(46),
  },
  {
    id: 6,
    locationId: 4,
    userId: 1,
    queueLevel: "long",
    waitMinutes: 37,
    peopleCount: 23,
    passiveDetected: false,
    source: "business",
    trustWeight: 1.55,
    createdAt: minutesAgo(9),
  },
  {
    id: 7,
    locationId: 4,
    userId: 1,
    queueLevel: "medium",
    waitMinutes: 24,
    peopleCount: 14,
    passiveDetected: false,
    source: "user",
    trustWeight: 1.18,
    createdAt: minutesAgo(37),
  },
  {
    id: 8,
    locationId: 5,
    userId: 1,
    queueLevel: "medium",
    waitMinutes: 12,
    peopleCount: 8,
    passiveDetected: true,
    source: "user",
    trustWeight: 1.18,
    createdAt: minutesAgo(18),
  },
];

const bookings = [
  {
    id: 1,
    userId: 1,
    locationId: 1,
    scheduledFor: "14:30",
    predictedWaitMinutes: 3,
    status: "confirmed",
    createdAt: minutesAgo(20),
  },
];

const behaviorEvents = [
  { id: 1, userId: 1, locationId: 1, type: "view", createdAt: minutesAgo(55) },
  { id: 2, userId: 1, locationId: 1, type: "arrival", createdAt: minutesAgo(18) },
  { id: 3, userId: 1, locationId: 3, type: "view", createdAt: minutesAgo(34) },
  { id: 4, userId: 1, locationId: 3, type: "booking", createdAt: minutesAgo(22) },
  { id: 5, userId: 1, locationId: 4, type: "arrival", createdAt: minutesAgo(9) },
];

const referrals = [
  {
    id: 1,
    inviterUserId: 1,
    inviteeEmail: "friend1@example.com",
    bonusPoints: 25,
    createdAt: minutesAgo(60 * 24),
  },
];

const predictions = [];

function nextId(collection) {
  return collection.reduce((maxValue, item) => Math.max(maxValue, item.id), 0) + 1;
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findUserById(userId) {
  return users.find((user) => user.id === Number(userId));
}

function addUser(payload) {
  const user = {
    id: nextId(users),
    reputationPoints: 0,
    trustScore: 50,
    updatesCount: 0,
    streakDays: 1,
    savedMinutes: 0,
    invitedFriends: 0,
    referralBonuses: 0,
    role: "consumer",
    referralCode: `USER${users.length + 1}`,
    managedLocationIds: [],
    provider: "email",
    createdAt: new Date().toISOString(),
    ...payload,
  };
  users.push(user);
  return user;
}

function getLocationById(locationId) {
  return locations.find((location) => location.id === Number(locationId));
}

function getReportsByLocation(locationId) {
  return queueReports
    .filter((report) => report.locationId === Number(locationId))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function addQueueReport(payload) {
  const report = {
    id: nextId(queueReports),
    createdAt: new Date().toISOString(),
    passiveDetected: false,
    source: "user",
    trustWeight: 1,
    ...payload,
  };
  queueReports.push(report);
  return report;
}

function addBooking(payload) {
  const booking = {
    id: nextId(bookings),
    createdAt: new Date().toISOString(),
    status: "confirmed",
    ...payload,
  };
  bookings.push(booking);
  return booking;
}

function getBookingsByLocation(locationId) {
  return bookings
    .filter((booking) => booking.locationId === Number(locationId))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function getBookingsByUser(userId) {
  return bookings
    .filter((booking) => booking.userId === Number(userId))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function addBehaviorEvent(payload) {
  const event = {
    id: nextId(behaviorEvents),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  behaviorEvents.push(event);
  return event;
}

function getBehaviorByLocation(locationId) {
  return behaviorEvents
    .filter((event) => event.locationId === Number(locationId))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function addReferral(payload) {
  const referral = {
    id: nextId(referrals),
    createdAt: new Date().toISOString(),
    bonusPoints: 25,
    ...payload,
  };
  referrals.push(referral);
  return referral;
}

function getReferralsByUser(userId) {
  return referrals
    .filter((referral) => referral.inviterUserId === Number(userId))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function updateUserStats(userId, deltas = {}) {
  const user = users.find((item) => item.id === Number(userId));
  if (!user) {
    return null;
  }

  user.updatesCount += deltas.updatesCountDelta || 0;
  user.reputationPoints += deltas.pointsDelta || 0;
  user.savedMinutes += deltas.savedMinutesDelta || 0;
  user.trustScore = Math.max(0, Math.min(100, user.trustScore + (deltas.trustDelta || 0)));
  user.invitedFriends += deltas.invitedFriendsDelta || 0;
  user.referralBonuses += deltas.referralBonusesDelta || 0;
  return user;
}

function upsertPrediction(nextPrediction) {
  const existingIndex = predictions.findIndex(
    (prediction) => prediction.locationId === nextPrediction.locationId,
  );

  if (existingIndex >= 0) {
    predictions[existingIndex] = nextPrediction;
    return predictions[existingIndex];
  }

  predictions.push(nextPrediction);
  return nextPrediction;
}

module.exports = {
  db: {
    users,
    locations,
    queueReports,
    bookings,
    behaviorEvents,
    referrals,
    predictions,
  },
  sanitizeUser,
  findUserByEmail,
  findUserById,
  addUser,
  getLocationById,
  getReportsByLocation,
  addQueueReport,
  addBooking,
  getBookingsByLocation,
  getBookingsByUser,
  addBehaviorEvent,
  getBehaviorByLocation,
  addReferral,
  getReferralsByUser,
  updateUserStats,
  upsertPrediction,
};
