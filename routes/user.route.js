const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { uploadFile } = require('../middleware/uploadfile');
require('dotenv').config();

// =======================
// Nodemailer config
// =======================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// =======================
// REGISTER
// =======================
router.post('/register', uploadFile.single('avatar'), async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    // avatar optionnel
    const avatar = req.file ? req.file.filename : null;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const newUser = new User({
      email,
      password,
      firstname,
      lastname,
      avatar,
    });

    const createdUser = await newUser.save();

    // Email de vérification
    const mailOptions = {
      from: `"Verify your email" <${process.env.EMAIL_USER}>`,
      to: createdUser.email,
      subject: 'Verify your email',
      html: `
        <h2>Hello ${createdUser.firstname}</h2>
        <p>Please verify your email</p>
        <a href="http://${req.headers.host}/api/users/status/edit?email=${createdUser.email}">
          Click here
        </a>
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log(err);
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: createdUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =======================
// GET ALL USERS
// =======================
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// LOGIN
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email }).select('+password +isActive');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account doesn't exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account inactive',
      });
    }

    delete user._doc.password;

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      user,
      token,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// ACTIVATE / DEACTIVATE USER
// =======================
router.get('/status/edit', async (req, res) => {
  try {
    const email = req.query.email;
    const user = await User.findOne({ email });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// TOKENS
// =======================
const generateAccessToken = (user) => {
  return jwt.sign(
    { iduser: user._id, role: user.role },
    process.env.SECRET,
    { expiresIn: '60s' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { iduser: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1y' }
  );
};

router.post('/refreshToken', (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Token not found' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const newToken = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    res.status(200).json({
      token: newToken,
      refreshToken: newRefresh,
    });
  });
});

module.exports = router;
