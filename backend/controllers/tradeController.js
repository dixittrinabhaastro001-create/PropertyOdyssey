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
        const entry = await Entry.findByIdAndUpdate(entryId, { team: toTeamId }, { new: true });
        // Get propertyId from entry
        const propertyId = entry.mapId || entry.propertyId || entry._id;
        // Update buyedProperties for both teams
        await Team.findByIdAndUpdate(fromTeamId, { $pull: { buyedProperties: propertyId } });
        await Team.findByIdAndUpdate(toTeamId, { $addToSet: { buyedProperties: propertyId } });
        // Update owners array in Property model
        const Property = (await import('../models/Property.js')).default;
        await Property.findByIdAndUpdate(propertyId, {
            $pull: { owners: fromTeamId },
            $addToSet: { owners: toTeamId }
        });
        return res.status(200).json({ message: `Trade successful! Seller cut: ${formatCurrency(sellerDeduct)}, Buyer cut: ${formatCurrency(buyerDeduct)}, Trade amount: ${formatCurrency(tradeAmount)}.` });
    } catch (err) {
        console.error('Trade error:', err);
        res.status(500).json({ message: 'An error occurred during the trade.' });
    }
};
