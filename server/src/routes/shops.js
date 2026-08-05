const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { auth, requireOwner } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'owner' ? {} : { active: true };
    const shops = await Shop.find(query);
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { shopName } = req.body;
    let existing = await Shop.findOne({ shopName: { $regex: new RegExp('^' + shopName + '$', 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'Shop name already exists' });
    }
    
    const shop = new Shop({ shopName });
    await shop.save();
    res.status(201).json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, requireOwner, async (req, res) => {
  try {
    const { shopName, active } = req.body;
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    
    if (shopName) {
      let existing = await Shop.findOne({ shopName: { $regex: new RegExp('^' + shopName + '$', 'i') }, _id: { $ne: shop._id } });
      if (existing) return res.status(400).json({ message: 'Shop name already exists' });
      shop.shopName = shopName;
    }
    if (active !== undefined) shop.active = active;
    
    await shop.save();
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, requireOwner, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    
    shop.active = false;
    await shop.save();
    res.json({ message: 'Shop deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
