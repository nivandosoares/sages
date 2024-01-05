const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const {
  getForm,
  getSudoForm,
  sudoCreateEvent,
  getEvents,
  createEvent,
  getAprovedEvents,
  getPendingEvents,
  getRejectedEvents,
  getCalendar,
  getEvent,
  getAllEvents,
  mailResponse,
  isAdmin,
  updateEventStatus,
  renderEvent,
} = require("../controllers/event_controller");

const { login, createAdminUsers } = require("../controllers/user_controller");

// Middleware for handling file uploads
router.use(fileUpload());

// Route for the home page
router.get("/", getEvents);

// Route for getting all events
router.get("/events-all", getAllEvents);

// Routes for getting approved, pending, and rejected events
router.get("/aproved-events", getAprovedEvents);
router.get("/pending-events", getPendingEvents);
router.get("/rejected-events", getRejectedEvents);

// Route for the event scheduling form
router.get("/agendar", getForm);

// Route for the sudo form
router.get("/sudo", getSudoForm);

// Route for rendering an event by id
router.get("/status/:id", renderEvent);

// Route for getting an event by id
router.get("/event/:id", getEvent);

// Route for creating admin users (should be run once)
router.post("/first-run", createAdminUsers);

// Routes for success and error pages
router.get("/success", (req, res) => {
  res.render("success");
});
router.get("/error", (req, res) => {
  res.render("error");
});

// Route for handling the form submission
router.post("/agendar", createEvent);

// Route for handling the sudo form submission
router.post("/sudo", sudoCreateEvent);

// Route for the login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Route for handling login
router.post("/login", login);

// Route for updating event status
router.put("/event/:id", updateEventStatus);

module.exports = router;
