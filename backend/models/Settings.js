import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    settingsId: { type: String, default: 'global_settings', unique: true },
    stampDuty: {
        Residential: { type: Number, default: 5 },
        Commercial: { type: Number, default: 6 },
        Industrial: { type: Number, default: 6 }
    },
    registrationFeePercent: { type: Number, default: 1 }
});

export default mongoose.model('Settings', settingsSchema);
