import express from 'express';
import Property from '../models/Property.js';
import verifyToken from '../middleware/verifyToken.js';
const router = express.Router();

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find({});
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching properties.' });
  }
});

// Get a single property by propertyNo
router.get('/:propertyNo', async (req, res) => {
  try {
    const property = await Property.findOne({ propertyNo: req.params.propertyNo });
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching property.' });
  }
});

export default router;
