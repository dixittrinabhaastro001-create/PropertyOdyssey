import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['Broker', 'Manager', 'Participant'] },
    tableAccess: { type: String }, // For Managers
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' } // For Participants
});

export default mongoose.model('User', userSchema);
