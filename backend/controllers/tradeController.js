import Team from '../models/Team.js';
import Entry from '../models/Entry.js';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export const tradeProperty = async (req, res) => {
    const { fromTeamId, toTeamId, entryId, tradeAmount, sellerPercentCut = 0, buyerPercentCut = 0 } = req.body;
    try {
        const sellerTeam = await Team.findById(fromTeamId);
        const buyerTeam = await Team.findById(toTeamId);
        if (!sellerTeam || !buyerTeam) {
            return res.status(404).json({ message: 'Seller or buyer team not found.' });
        }
        const sellerDeduct = tradeAmount * (sellerPercentCut / 100);
        const buyerDeduct = tradeAmount * (buyerPercentCut / 100);
        if (buyerTeam.walletBalance < (buyerDeduct + tradeAmount)) {
            return res.status(400).json({ message: `Buyer team does not have enough balance for the deduction and trade amount (${formatCurrency(buyerDeduct + tradeAmount)}).` });
        }
        if (sellerTeam.walletBalance < sellerDeduct) {
            return res.status(400).json({ message: `Seller team does not have enough balance for the deduction (${formatCurrency(sellerDeduct)}).` });
        }
        // Deduct percent cut from seller
        await Team.findByIdAndUpdate(fromTeamId, { $inc: { walletBalance: -sellerDeduct } });
        // Deduct percent cut and trade amount from buyer
        await Team.findByIdAndUpdate(toTeamId, { $inc: { walletBalance: -(buyerDeduct + tradeAmount) } });
        // Add trade amount to seller
        await Team.findByIdAndUpdate(fromTeamId, { $inc: { walletBalance: tradeAmount } });
        // Transfer property entry ownership
        const entry = await Entry.findById(entryId);
        if (!entry) return res.status(404).json({ message: 'Entry not found.' });
        // Get propertyId and table from entry
        const propertyId = entry.propertyId;
        const table = entry.table;
        // Update entry to new team
        entry.team = toTeamId;
        await entry.save();
        // Update buyedProperties for both teams
        await Team.findByIdAndUpdate(fromTeamId, { $pull: { buyedProperties: propertyId } });
        await Team.findByIdAndUpdate(toTeamId, { $addToSet: { buyedProperties: propertyId } });
        // Update owners array in Property model: remove seller, add buyer with correct annualRent/totalCost
        const Property = (await import('../models/Property.js')).default;
        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ message: 'Property not found.' });
        // Find the seller's owner object for this table
        const sellerOwner = property.owners.find(o => o.team.toString() === fromTeamId && o.table === table);
        if (!sellerOwner) return res.status(404).json({ message: 'Seller owner record not found.' });
        // Remove seller's owner object
        property.owners = property.owners.filter(o => !(o.team.toString() === fromTeamId && o.table === table));
        // Add buyer's owner object (copying annualRent, totalCost, and rentPercent from seller)
        property.owners.push({
            team: toTeamId,
            table,
            annualRent: sellerOwner.annualRent,
            totalCost: sellerOwner.totalCost,
            rentPercent: sellerOwner.rentPercent
        });
        await property.save();
        return res.status(200).json({ message: `Trade successful! Seller cut: ${formatCurrency(sellerDeduct)}, Buyer cut: ${formatCurrency(buyerDeduct)}, Trade amount: ${formatCurrency(tradeAmount)}.` });
    } catch (err) {
        console.error('Trade error:', err);
        res.status(500).json({ message: 'An error occurred during the trade.' });
    }
};
