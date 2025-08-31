import Property from '../models/Property.js';

// Bulk update property prices by percent change
export const bulkUpdateProperties = async (req, res) => {
  const { propertyNumbers, percentChange, reset } = req.body;
  try {
    if (!Array.isArray(propertyNumbers) || propertyNumbers.length === 0) {
      return res.status(400).json({ message: 'No property numbers provided.' });
    }
    const properties = await Property.find({ propertyNo: { $in: propertyNumbers } });
    if (properties.length === 0) {
      return res.status(404).json({ message: 'No properties found.' });
    }
    for (const prop of properties) {
      if (reset) {
        // Only restore if originalGrandTotal exists
        if (typeof prop.originalGrandTotal === 'number') {
          prop.grandTotal = prop.originalGrandTotal;
        }
      } else {
        // Set originalGrandTotal only if not set before
        if (typeof prop.originalGrandTotal !== 'number') {
          prop.originalGrandTotal = prop.grandTotal;
        }
        prop.grandTotal = Math.round(prop.originalGrandTotal * (1 + percentChange / 100));
      }
      await prop.save();
    }
    res.json({ message: 'Properties updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating properties.' });
  }
};
