const express = require('express');
const router = express.Router();
const Customer = require('../models/customers.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

router.post('/signup', async (req, res) => {
  const { username, email, mobileNumber, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
      username,
      email,
      mobileNumber,
      password: hashedPassword
    });
    await customer.save();
    res.status(201).json({ message: "Customer registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering customer", error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: customer._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ message: "Login successful", customer, token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).send(customers);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Customer not found');
    res.status(200).send(customer);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).send('Customer not found');
    res.status(200).send(customer);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).send('Customer not found');
    res.status(200).send(customer);
  } catch (err) {
    res.status(500).send(err);
  }
});


// POST: Forgot Password
router.post('/forget-password', async (req, res) => {
  const { email } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = Date.now() + 3600000;
    await customer.save();
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: 'condingdevelopment@gmail.com',
        pass: 'vsyp jvun lpau wfme'
      },
    });

    const mailOptions = {
      to: customer.email,
      from: 'your-email@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://localhost:4200/reset/${resetToken}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing your request', error: error.message });
  }
});


// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!customer) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const { password } = req.body;
    customer.password = await bcrypt.hash(password, 10);
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
});

module.exports = router;
