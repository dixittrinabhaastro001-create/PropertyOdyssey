
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



// Admin-only: End round for all tables
export const endAllRounds = async (req, res) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden: Only admins can end all rounds.' });
    }
    try {
        const Property = (await import('../models/Property.js')).default;
        const Team = (await import('../models/Team.js')).default;

        // 1. Increase grandTotal of all properties by 10%
        await Property.updateMany({}, [
            { $set: { grandTotal: { $multiply: ["$grandTotal", 1.1] } } }
        ]);

        // 2. For each property, increase annualRent and totalCost for each owner by 10%
        const allProperties = await Property.find({});
        for (const property of allProperties) {
            let updatedOwners = property.owners.map(owner => {
                let updatedOwner = { ...owner._doc };
                if (typeof updatedOwner.annualRent === 'number') {
                    updatedOwner.annualRent = Math.round(updatedOwner.annualRent * 1.1);
                }
                if (typeof updatedOwner.totalCost === 'number') {
                    updatedOwner.totalCost = Math.round(updatedOwner.totalCost * 1.1);
                }
                return updatedOwner;
            });
            property.owners = updatedOwners;
            await property.save();
        }

        // 3. For each team, sum up updated annualRent from all properties they own (from owners array)
        const teams = await Team.find({});
        for (const team of teams) {
            // Find all properties where this team is an owner
            const properties = await Property.find({ 'owners.team': team._id });
            let totalAnnualRent = 0;
            for (const property of properties) {
                // Find the owner's object for this team
                const ownerObj = property.owners.find(o => o.team.toString() === team._id.toString());
                if (ownerObj && typeof ownerObj.annualRent === 'number') {
                    totalAnnualRent += ownerObj.annualRent;
                }
            }
            if (totalAnnualRent > 0) {
                await Team.findByIdAndUpdate(team._id, { $inc: { walletBalance: totalAnnualRent } });
            }
        }
        res.status(200).json({ message: 'All rounds ended. All property grandTotals, annualRents, and totalCosts increased by 10%. All teams received their annual rents.' });
    } catch (err) {
        console.error("End All Rounds Error:", err);
        res.status(500).json({ message: "Error processing end of all rounds." });
    }
};
