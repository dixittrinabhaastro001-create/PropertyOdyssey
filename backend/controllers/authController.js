import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { username, password, role, tableAccess } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Username, password, and role are required.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword, role, tableAccess });
        await newUser.save();
        res.status(201).json({ message: `User '${username}' registered successfully.` });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration.', error });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const tokenPayload = {
            userId: user._id,
            username: user.username,
            role: user.role,
            ...(user.role === 'Manager' && { tableAccess: user.tableAccess }),
            ...(user.role === 'Participant' && { teamId: user.teamId }),
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: tokenPayload });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
};
