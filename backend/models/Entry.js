import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
    table: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    annualRent: { type: Number, required: true },
    id: Number,
    name: String,
    mapId: Number,
    category: String,
    status: String,
    grandTotal: Number,
    brokeragePercent: Number,
    totalCost: Number,
    hazardTypes: [{ type: String }],
    rentPercent: { type: Number }
}, { timestamps: true });

export default mongoose.model('Entry', entrySchema);
