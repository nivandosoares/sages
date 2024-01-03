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

const { login, insertUsers } = require("../controllers/user_controller");
router.use(fileUpload());

// Rota para a página inicial
router.get("/", getEvents);
router.get("/events-all", getAllEvents);
router.get("/aproved-events", getAprovedEvents);
router.get("/pending-events", getPendingEvents);
router.get("/rejected-events", getRejectedEvents);

// Rota para o formulário de agendamento
router.get("/agendar", getForm);
router.get("/sudo", getSudoForm);
router.get("/status/:id", renderEvent);

router.get("/event/:id", getEvent);

router.get("/success", (req, res) => {
  res.render("success");
});

router.get("/error", (req, res) => {
  res.render("error");
});

// Rota para lidar com a submissão do formulário
router.post("/agendar", createEvent);
router.post("/sudo", sudoCreateEvent);
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", login);
router.put("/event/:id", updateEventStatus);
module.exports = router;
