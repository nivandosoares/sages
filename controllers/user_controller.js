const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const User = require("../models/user_model");
const Event = require("../models/event_model"); // Import the Event model
const { isAdmin } = require("./event_controller");

const signin = async (req, res) => {
  try {
    const user = await User.create({
      username,
      role: "admin",
      email,
      password: bcrypt.hashSync(password, 10),
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(201).send({ auth: true, token: token });
  } catch (error) {
    res.status(500).send(error);
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    // Fetch all events
    const events = await Event.find({});

    // Pass the events to the dashboard view
    res.render("dashboard", { events: events, moment: moment });
  } catch (error) {
    res.status(500).send(error);
  }
};
const fetchUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      req.user = user; // Attach the user to req.user
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  next();
};
module.exports = {
  login,
  signin,
  fetchUser,
};
