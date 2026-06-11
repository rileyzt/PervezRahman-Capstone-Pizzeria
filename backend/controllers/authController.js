// AUTH CONTROLLER — Register, Login, Get Profile
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// REGISTER 
// Creates a new user account
const register = async (req, res) => {
  try {
    // Get the data that user typed in the form
    const { name, email, password, phone } = req.body;

    //Check if someone already registered with this email
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'This email is already registered' });
    }

    // Save the new user to database
    // Password gets hashed automatically (check User.js model  pre save hook)
    const user = await User.create({ name, email, password, phone });

    // Create a JWT token for this user
    const token = generateToken(user._id, user.role);

    // Send back the token and user info
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

//LOGIN
// Checks email + password and returns a token
const login = async (req, res) => {
  try {
    // Get email and password from the form
    const { email, password } = req.body;

    //Find the user by email
    const user = await User.findOne({ email });

    // If no user found, return error
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Password matched, Creating token and send it
    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
// GET PROFILE
// Returns the logged--in user's info
const getProfile = async (req, res) => {
  try {
    // req.user was set by authMiddleware after verifying the token
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

module.exports = { register, login, getProfile };
