import Entry from '../models/Entry.js';
import Team from '../models/Team.js';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export const createEntry = async (req, res) => {
    if (req.user.role === 'Participant') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    const { team: teamId, grandTotal, brokeragePercent, category } = req.body;
    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found.' });
    // Calculate totalCost using new logic
    const stampDutyRates = { residential: 6, commercial: 7, industrial:8 , prospectus:7, agriculture:7, industry:8 };
    const stampDutyPercent = stampDutyRates[category] || 0;
    const brokerage = grandTotal * ((parseFloat(brokeragePercent) || 0) / 100);
    const baseWithBrokerage = grandTotal + brokerage;
    const stampDuty = baseWithBrokerage * (stampDutyPercent / 100);
    const registrationFee = baseWithBrokerage * 0.01;
    const totalCost = grandTotal + brokerage + stampDuty + registrationFee;
    if (team.walletBalance < totalCost) return res.status(400).json({ message: `Insufficient funds. Wallet has: ${formatCurrency(team.walletBalance)}` });

    // Save entry with calculated totalCost
    const rentPercent = req.body.rentPercent;
    const annualRent = Math.round(totalCost * (rentPercent / 100));
    const entryData = { ...req.body, totalCost, rentPercent, annualRent };
    const newEntry = new Entry(entryData);
    await newEntry.save();
        // Add property to team's buyedProperties and team to property's owners using propertyId and table
        const propertyId = newEntry.propertyId;
        const table = newEntry.table;
        if (!propertyId || !table) {
            return res.status(400).json({ message: 'propertyId and table are required in entry.' });
        }
        const Property = (await import('../models/Property.js')).default;
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found.' });
        }
        // Check if property is already owned in this table
        const alreadyOwned = property.owners.some(o => o.table === table);
        if (alreadyOwned) {
            return res.status(400).json({ message: 'Property is already owned in this table.' });
        }
        await Team.findByIdAndUpdate(teamId, {
            $inc: {
                expenditure: totalCost,
                walletBalance: -totalCost
            },
            $addToSet: { buyedProperties: propertyId }
        });
        // Add owner with annualRent and rentPercent to property.owners array
        await Property.findByIdAndUpdate(propertyId, {
            $addToSet: { owners: { team: teamId, table, annualRent, totalCost, rentPercent } }
        });
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ message: 'Error creating entry.' });
    }
};

export const updateEntry = async (req, res) => {
    if (req.user.role === 'Participant') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const originalEntry = await Entry.findById(req.params.id);
        if (!originalEntry) return res.status(404).json({ message: 'Entry not found' });

    const priceDifference = req.body.totalCost - originalEntry.totalCost;
        const teamId = originalEntry.team;

        const team = await Team.findById(teamId);
        if (priceDifference > 0 && team.walletBalance < priceDifference) {
            return res.status(400).json({ message: `Insufficient funds for update. Wallet has: ${formatCurrency(team.walletBalance)}`});
        }

    const rentPercent = req.body.rentPercent;
    const annualRent = Math.round(req.body.totalCost * (rentPercent / 100));
    const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, { ...req.body, rentPercent, annualRent }, { new: true });
        await Team.findByIdAndUpdate(teamId, {
            $inc: {
                expenditure: priceDifference,
                walletBalance: -priceDifference
            }
        });
        // Also update property.owners array for this team/table with new annualRent, totalCost, and rentPercent
        if (updatedEntry.propertyId) {
            const Property = (await import('../models/Property.js')).default;
            await Property.updateOne(
                { _id: updatedEntry.propertyId, "owners.team": teamId, "owners.table": originalEntry.table },
                { $set: { "owners.$.annualRent": annualRent, "owners.$.totalCost": req.body.totalCost, "owners.$.rentPercent": rentPercent } }
            );
        }
        res.json(updatedEntry);
    } catch (err) {
        res.status(400).json({ message: 'Error updating entry.' });
    }
};

export const deleteEntry = async (req, res) => {
    if (req.user.role === 'Participant') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        const teamId = entry.team;
        const propertyId = entry.propertyId;
        const table = entry.table;
    const deletedAmount = entry.totalCost;
        await Entry.findByIdAndDelete(req.params.id);
        await Team.findByIdAndUpdate(teamId, {
            $inc: {
                expenditure: -deletedAmount,
                walletBalance: deletedAmount
            },
            $pull: { buyedProperties: propertyId }
        });
        if (propertyId && table) {
            const Property = (await import('../models/Property.js')).default;
            await Property.findByIdAndUpdate(propertyId, {
                $pull: { owners: { team: teamId, table: table } }
            });
        }
        res.json({ message: 'Entry deleted, finances updated, and ownership removed.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting entry.' });
    }
};

export const getAllEntries = async (req, res) => {
    try {
        const allEntries = await Entry.find({})
            .sort({ createdAt: -1 })
            .populate('team', 'name tableId');
        res.json(allEntries);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching all entries.' });
    }
};

export const getTeamEntries = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { table } = req.query;
        const query = { team: teamId, table: table };
        const entries = await Entry.find(query);
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching team entries.' });
    }
};
