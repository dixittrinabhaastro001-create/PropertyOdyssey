
import Team from '../models/Team.js';
import Entry from '../models/Entry.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Add or Deduct wallet balance for a team
export const updateTeamWallet = async (req, res) => {
    // Only Manager or Admin can update wallet
    if (!['Manager', 'Admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Only managers or admins can update team wallets.' });
    }
    const { teamId, amount, isPercent, isDeduct } = req.body;
    if (!teamId || typeof amount !== 'number') {
        return res.status(400).json({ message: 'Missing teamId or amount.' });
    }
    try {
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: 'Team not found.' });
        let finalAmount = amount;
        if (isPercent) {
            finalAmount = Math.round(team.walletBalance * (amount / 100));
        }
        if (isDeduct) {
            finalAmount = -Math.abs(finalAmount);
        }
        team.walletBalance += finalAmount;
        await team.save();
        res.json({ message: `Wallet updated by ${finalAmount}.`, walletBalance: team.walletBalance });
    } catch (err) {
        res.status(500).json({ message: 'Error updating wallet.' });
    }
};

export const getTeams = async (req, res) => {
    try {
        const teams = await Team.find({ tableId: req.params.tableId });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching teams' });
    }
};

export const createTeam = async (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Forbidden: Only managers can create teams.' });
    }
    const { name, tableId } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const newTeam = new Team({ name, tableId });
        await newTeam.save({ session });

        const participantUsername = `${name.toLowerCase().replace(/\s+/g, '')}_${tableId}`;
        const participantPassword = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(participantPassword, salt);

        const newParticipant = new User({
            username: participantUsername,
            password: hashedPassword,
            role: 'Participant',
            teamId: newTeam._id
        });
        await newParticipant.save({ session });

        await session.commitTransaction();
        res.status(201).json({
            team: newTeam,
            credentials: { username: participantUsername, password: participantPassword }
        });
    } catch (err) {
        await session.abortTransaction();
        if (err.code === 11000) {
             return res.status(409).json({ message: 'A team with this name already exists for this table.' });
        }
        res.status(400).json({ message: 'Error creating team.' });
    } finally {
        session.endSession();
    }
};

export const deleteTeam = async (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Forbidden: Only managers can delete teams.' });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const teamId = req.params.id;
        await Team.findByIdAndDelete(teamId, { session });
        await Entry.deleteMany({ team: teamId }, { session });
        await User.findOneAndDelete({ teamId: teamId }, { session });

        // Remove team from all property owners arrays
        const Property = (await import('../models/Property.js')).default;
        await Property.updateMany(
            { 'owners.team': teamId },
            { $pull: { owners: { team: teamId } } },
            { session }
        );

        await session.commitTransaction();
        res.json({ message: 'Team, participant user, associated entries, and property ownerships deleted successfully' });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Error deleting team' });
    } finally {
        session.endSession();
    }
};

export const endRound = async (req, res) => {
    if (req.user.role !== 'Manager') {
        return res.status(403).json({ message: 'Forbidden: Only managers can end the round.' });
    }
    const { tableAccess } = req.user;
    try {
        const teamsInTable = await Team.find({ tableId: tableAccess });
        await Promise.all(teamsInTable.map(async (team) => {
            const entries = await Entry.find({ team: team._id });
            const totalRentIncome = entries.reduce((sum, entry) => sum + (entry.annualRent * 5), 0);
            if (totalRentIncome > 0) {
                await Team.findByIdAndUpdate(team._id, { $inc: { walletBalance: totalRentIncome } });
            }
        }));
        res.status(200).json({ message: `Round ended for ${tableAccess}. Rental income added to wallets.` });
    } catch (err) {
        console.error("Round End Error:", err);
        res.status(500).json({ message: "Error processing round end." });
    }
};
