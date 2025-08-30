import bankRoutes from './routes/bankRoutes.js';

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import participantRoutes from './routes/participantRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import entryRoutes from './routes/entryRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', authRoutes);
app.use('/api/participant', participantRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/teams', teamRoutes);



app.use('/api/teams/bank', bankRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/properties', propertyRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});