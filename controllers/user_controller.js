const fs = require("fs");
const path = require("path");  // Don't forget to include the 'path' module
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const Event = require("../models/event_model");

const { isAdmin } = require("./event_controller");

const createAdminUsers = async (req, res) => {
  try {
    // Read the JSON file
    const filePath = path.join(__dirname, "mail_list.json");
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);

    // Iterate over institutes and courses to insert users
    for (const institute of data.institutes) {
      for (const course of institute.courses) {
        const username = course.coordinator.toLowerCase().replace(" ", ""); // Extract the username as specified
        const email = course.coordinatorEmail;
        const password = `${course.coordinator.split(" ")[0].toLowerCase()}.coordenacao`; // Generate the password

        try {
          // Create the user in the database
          const user = await User.create({
            username,
            role: "admin",
            email,
            password: bcrypt.hashSync(password, 10),
          });

          // Optionally, you can generate a token here and do something with it
          const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET
          );

          // Output success message or do further processing if needed
          console.log(`User created: ${user.username}`);
        } catch (error) {
          // If it's a duplicate key error, log a message and continue with the next iteration
          if (error.code === 11000) {
            console.warn(`Duplicate key error for email: ${email}. Skipping...`);
            continue;
          }

          // If it's a different error, log the error
          console.error("Error inserting user:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error inserting users from JSON:", error);
  }
};



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
  createAdminUsers,
};
