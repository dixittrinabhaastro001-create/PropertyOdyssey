import Entry from '../models/Entry.js';
import Team from '../models/Team.js';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export const triggerDisaster = async (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Forbidden: Only managers can trigger disasters.' });
    }
    const { disasterType, deductionAmount } = req.body;
    const { tableAccess } = req.user;
    if (!disasterType || !deductionAmount || deductionAmount <= 0) {
        return res.status(400).json({ message: 'Disaster type and a valid deduction amount are required.' });
    }
    try {
        const affectedEntries = await Entry.find({
            hazardTypes: disasterType,
            table: tableAccess
        });
        if (affectedEntries.length === 0) {
            return res.status(200).json({ message: `No properties were affected by the ${disasterType} in ${tableAccess}.` });
        }
        const affectedTeamIds = [...new Set(affectedEntries.map(entry => entry.team.toString()))];
        await Team.updateMany(
            { _id: { $in: affectedTeamIds } },
            { $inc: { walletBalance: -deductionAmount } }
        );
        res.status(200).json({
            message: `A ${disasterType} has occurred! ${affectedTeamIds.length} team(s) in ${tableAccess} have been fined ${formatCurrency(deductionAmount)}.`,
            affectedCount: affectedTeamIds.length
        });
    } catch (error) {
        console.error("Disaster trigger error:", error);
        res.status(500).json({ message: 'An error occurred while triggering the disaster.' });
    }
};
