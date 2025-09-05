import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tableId: { type: String, required: true },
    walletBalance: { type: Number, default: 10000000000 },
    expenditure: { type: Number, default: 0 },
    buyedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
});
teamSchema.index({ name: 1, tableId: 1 }, { unique: true });

export default mongoose.model('Team', teamSchema);
