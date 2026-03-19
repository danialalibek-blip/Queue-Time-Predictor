const express = require("express");
const {
  addReferral,
  db,
  findUserById,
  getReferralsByUser,
  updateUserStats,
} = require("../data/store");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/referrals/me", authRequired, (req, res) => {
  const user = findUserById(req.user.userId);
  return res.json({
    referralCode: user?.referralCode,
    invitedFriends: user?.invitedFriends || 0,
    referralBonuses: user?.referralBonuses || 0,
    referrals: getReferralsByUser(req.user.userId),
  });
});

router.post("/referrals/redeem", authRequired, (req, res) => {
  const { code, inviteeEmail } = req.body || {};
  const inviter = db.users.find((user) => user.referralCode === code);

  if (!inviter) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Referral code not found" });
  }

  if (inviter.id === req.user.userId) {
    return res.status(400).json({ error: "SELF_REFERRAL", message: "Cannot redeem own code" });
  }

  const referral = addReferral({
    inviterUserId: inviter.id,
    inviteeEmail: inviteeEmail || req.user.email,
  });
  updateUserStats(inviter.id, {
    pointsDelta: 25,
    invitedFriendsDelta: 1,
    referralBonusesDelta: 25,
  });

  return res.status(201).json({ referral, inviterUserId: inviter.id });
});

module.exports = router;
