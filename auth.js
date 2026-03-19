const express = require("express");
const { addUser, findUserByEmail, sanitizeUser } = require("../data/store");
const { signToken } = require("../utils/jwt");
const { hashPassword, verifyPassword } = require("../utils/password");

const router = express.Router();

function issueAuthResponse(user, res) {
  const token = signToken(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "queue-time-predictor-secret",
    Number(process.env.TOKEN_TTL_HOURS || 720),
  );

  return res.json({
    token,
    user: sanitizeUser(user),
  });
}

router.post("/register", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "name, email and password are required",
    });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({
      error: "EMAIL_EXISTS",
      message: "User with this email already exists",
    });
  }

  const user = addUser({
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
  });

  return issueAuthResponse(user, res.status(201));
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "email and password are required",
    });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      error: "INVALID_CREDENTIALS",
      message: "Email or password is incorrect",
    });
  }

  return issueAuthResponse(user, res);
});

module.exports = router;
