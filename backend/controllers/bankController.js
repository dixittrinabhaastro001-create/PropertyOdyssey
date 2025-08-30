import Team from '../models/Team.js';

export const bankOperation = async (req, res) => {
    const { teamId, amount } = req.body;
    if (!teamId || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Team ID and amount are required.' });
    }
    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found.' });
        await Team.findByIdAndUpdate(teamId, { $inc: { walletBalance: amount } });
        return res.status(200).json({ message: `Bank operation successful. Wallet updated by ${amount}.` });
    } catch (err) {
        console.error('Bank operation error:', err);
        res.status(500).json({ message: 'An error occurred during the bank operation.' });
    }
};
