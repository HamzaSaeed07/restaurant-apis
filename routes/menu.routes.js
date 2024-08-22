const express = require('express');
const router = express.Router();
const Menu = require('../models/menu.model');

// Create new menu 
router.post('/', async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    res.status(201).send(menu);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find();

    const categorizedMenus = [
      {
        label: 'Breakfast',
        items: menus.filter(item => item.category === 'Breakfast')
      },
      {
        label: 'Lunch',
        items: menus.filter(item => item.category === 'Lunch')
      },
      {
        label: 'Dinner',
        items: menus.filter(item => item.category === 'Dinner')
      },
      {
        label: 'Dessert',
        items: menus.filter(item => item.category === 'Dessert')
      }
    ];

    res.status(200).send(categorizedMenus);
  } catch (err) {
    res.status(500).send({ error: 'Error fetching menu items' });
  }
});


// Get a single menu
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).send('Menu item not found');
    res.status(200).send(menu);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update a menu item
router.put('/:id', async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!menu) return res.status(404).send('Menu item not found');
    res.status(200).send(menu);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete a menu item
router.delete('/:id', async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).send('Menu item not found');
    res.status(200).send(menu);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
