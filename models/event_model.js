const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  initialDate: {
    type: Date,
    required: true,
  },
  finalDate: {
    type: Date,
    required: true,
  },
  initialHour: {
    type: String,
    required: true,
  },
  finalHour: {
    type: String,
    required: true,
  },
  resources: {
    type: String,
    required: true,
  },
  requested_by: {
    type: String,
    required: true,
  },
  responsible: {
    type: String,
    required: true,
  },
  requested_at: {
    type: Date,
    required: true,
  },
  responsible_email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Pendente",
  },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
