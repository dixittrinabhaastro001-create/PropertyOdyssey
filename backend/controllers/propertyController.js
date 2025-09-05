// Remove a team from the owners array of a property
export const removeTeamOwnerFromProperty = async (req, res) => {
  try {
    const { propertyNo } = req.params;
    const { teamId } = req.body;
    if (!teamId) return res.status(400).json({ message: 'teamId required.' });
    const property = await Property.findOne({ propertyNo });
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    const originalLength = property.owners.length;
    property.owners = property.owners.filter(o => o.team.toString() !== teamId);
    if (property.owners.length === originalLength) {
      return res.status(404).json({ message: 'Owner not found for this team.' });
    }
    await property.save();
    // Remove property from team's buyedProperties array
    const Team = (await import('../models/Team.js')).default;
    await Team.updateOne(
      { _id: teamId },
      { $pull: { buyedProperties: property._id } }
    );
    res.json({ message: 'Team removed from property owners and property removed from team.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating property.' });
  }
};
import Property from '../models/Property.js';

// Bulk update property prices by percent change
export const bulkUpdateProperties = async (req, res) => {
  const { propertyNumbers, percentChange, reset, rentPercent, teamId, table } = req.body;
  try {
    if (!Array.isArray(propertyNumbers) || propertyNumbers.length === 0) {
      return res.status(400).json({ message: 'No property numbers provided.' });
    }
    let query = { propertyNo: { $in: propertyNumbers } };
    // If teamId and table are provided, filter to only properties owned by that team in that table
    if (teamId && table) {
      query["owners"] = { $elemMatch: { team: teamId, table: table } };
    }
    const properties = await Property.find(query);
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
      // Optionally update totalCost to match grandTotal (or recalculate if needed)
      prop.totalCost = prop.grandTotal;
      // Optionally update annualRent if rentPercent is provided
      if (typeof rentPercent === 'number') {
        prop.annualRent = Math.round(prop.totalCost * (rentPercent / 100));
      }
      await prop.save();
    }
    res.json({ message: 'Properties updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating properties.' });
  }
};
