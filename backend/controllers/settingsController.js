import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { settingsId: 'global_settings' },
            {},
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

export const updateSettings = async (req, res) => {
    if (req.user.role === 'Participant') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to change settings.' });
    }
    try {
        const updatedSettings = await Settings.findOneAndUpdate(
            { settingsId: 'global_settings' },
            { $set: { stampDuty: req.body.stampDuty } },
            { new: true }
        );
        res.json(updatedSettings);
    } catch (err) {
        res.status(500).json({ message: 'Error updating settings' });
    }
};
