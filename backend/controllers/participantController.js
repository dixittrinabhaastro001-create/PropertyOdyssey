import Team from '../models/Team.js';
import Entry from '../models/Entry.js';

export const getDashboard = async (req, res) => {
    if (req.user.role !== 'Participant' || !req.user.teamId) {
        return res.status(403).json({ message: 'Forbidden: Access restricted to Participants.' });
    }
    try {
        const team = await Team.findById(req.user.teamId);
        if (!team) {
            return res.status(404).json({ message: 'Associated team not found.' });
        }
        const entries = await Entry.find({ team: req.user.teamId }).sort({ createdAt: -1 });
        res.json({ teamData: team, purchaseHistory: entries });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching participant data.' });
    }
};
