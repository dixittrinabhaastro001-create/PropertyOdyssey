import mongoose from 'mongoose';
import Property from '../models/Property.js';
import dotenv from 'dotenv';
import propertyData from '../../frontend/src/data/propertyData.js';

dotenv.config();

async function importProperties() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing properties
  await Property.deleteMany({});
  console.log('Cleared existing properties');

  // Insert new properties
  await Property.insertMany(propertyData);
  console.log('Imported new properties');

  mongoose.disconnect();
}

importProperties().catch(err => {
  console.error('Error importing properties:', err);
  mongoose.disconnect();
});
