import express from 'express';
import Property from '../models/Property.js';
import verifyToken from '../middleware/verifyToken.js';
import { bulkUpdateProperties, removeTeamOwnerFromProperty } from '../controllers/propertyController.js';
const router = express.Router();
// Remove a team from the owners array of a property
router.post('/:propertyNo/remove-owner', verifyToken, removeTeamOwnerFromProperty);

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

// Bulk-update route for admin property price changes
router.post('/bulk-update', verifyToken, bulkUpdateProperties);

export default router;
