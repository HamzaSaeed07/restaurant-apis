const express = require('express');
const router = express.Router();
const Order = require('../models/orders.model')


router.post('/', async (req, res) => {
  try {
    const { customerId, items, totalPrice, shippingAddress, shippingMethod, phoneNumber, paymentMethod } = req.body;

    // Validate required fields
    if (!customerId || !items || !totalPrice || !shippingAddress || !shippingMethod || !phoneNumber || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newOrder = new Order({
      customerId,
      items,
      totalPrice,
      shippingAddress,
      shippingMethod,
      phoneNumber,
      paymentMethod
    });
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Error creating order' });
  }
});


router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId').populate('items.menuId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId').populate('items.menuId');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching order' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error updating order' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting order' });
  }
});
module.exports = router;
