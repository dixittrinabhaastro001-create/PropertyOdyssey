import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
	originalGrandTotal: { type: Number },
	propertyNo: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	status: { type: String },
	category: { type: String, required: true },
	plotArea: { type: Number },
	floorArea: { type: Number },
	widthOfAccess: { type: String },
	far: { type: Number },
	floors: { type: Number },
	totalBuildableArea: { type: Number },
	perSqFtCost: { type: Number },
	grandTotal: { type: Number },
	stampDuty: { type: Number },
	registrationFee: { type: Number },
	totalCost: { type: Number },
	monthlyRent: { type: Number },
	annualRent: { type: Number },
	rentalYield: { type: Number },
	hazardTypes: [{ type: String }],
	owners: [{
		team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
		table: { type: String, required: true }
	}]
});

export default mongoose.model('Property', propertySchema);
