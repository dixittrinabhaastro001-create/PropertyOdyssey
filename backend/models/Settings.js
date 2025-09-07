import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    settingsId: { type: String, default: 'global_settings', unique: true },
    stampDuty: {
        Residential: { type: Number, default: 6 },
        Commercial: { type: Number, default: 7 },
        Industrial: { type: Number, default: 8 }
    },
    registrationFeePercent: { type: Number, default: 1 }
});

export default mongoose.model('Settings', settingsSchema);
