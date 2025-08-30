import mongoose from 'mongoose';
import Property from '../models/Property.js';
import dotenv from 'dotenv';
import { verificationData } from '../../frontend/src/data/verificationData.js';
import { propertyData } from '../../frontend/src/data/propertyData.js';

dotenv.config();

async function importMergedProperties() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing properties
  await Property.deleteMany({});
  console.log('Cleared existing properties');

  // Merge propertyData and verificationData, flatten financials, and ensure all schema fields are present
  const merged = verificationData.map(v => {
    const match = propertyData.find(p => p.propertyNo === v.propertyNo);
    // Flatten financials from verificationData
    const financials = v.financials || {};
    return {
      propertyNo: v.propertyNo,
      id: match?.id ?? v.propertyNo, // Serial number
      mapId: match?.mapId ?? v.mapId, // Map ID
      name: v.name,
      status: v.status,
      category: v.category,
      plotArea: v.plotArea,
      floorArea: v.floorArea,
      widthOfAccess: v.widthOfAccess,
      far: v.far,
      floors: v.floors,
      totalBuildableArea: v.totalBuildableArea,
      perSqFtCost: v.perSqFtCost,
      // Financials (flattened)
      grandTotal: financials.grandTotal ?? match?.grandTotal,
      stampDuty: financials.stampDuty ?? match?.stampDuty,
      registrationFee: financials.registrationFee ?? match?.registrationFee,
      totalCost: financials.totalCost ?? match?.totalCost,
      monthlyRent: financials.monthlyRent ?? match?.monthlyRent,
      annualRent: financials.annualRent ?? match?.annualRent,
      rentalYield: financials.rentalYield ?? match?.rentalYield,
      // Hazard types from propertyData
      hazardTypes: match ? match.hazardTypes : [],
    };
  });

  await Property.insertMany(merged);
  console.log('Imported merged and flattened property data');

  mongoose.disconnect();
}

importMergedProperties().catch(err => {
  console.error('Error importing merged properties:', err);
  mongoose.disconnect();
});
