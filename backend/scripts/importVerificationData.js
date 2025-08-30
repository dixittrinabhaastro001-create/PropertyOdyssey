import mongoose from 'mongoose';
import Property from '../models/Property.js';
import dotenv from 'dotenv';
import { verificationData } from '../../frontend/src/data/verificationData.js';

dotenv.config();

async function importVerificationData() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing properties
  await Property.deleteMany({});
  console.log('Cleared existing properties');

  // Insert new verification data
  await Property.insertMany(verificationData);
  console.log('Imported verification data');

  mongoose.disconnect();
}

importVerificationData().catch(err => {
  console.error('Error importing verification data:', err);
  mongoose.disconnect();
});
