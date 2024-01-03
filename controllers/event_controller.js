const Event = require("../models/event_model");
const path = require("path");
const nodemailer = require("nodemailer");
const moment = require("moment");
const fs = require("fs");

// Fix: Load institutes from JSON file
const configPath = path.join(__dirname, "mail_list.json");
const data = fs.readFileSync(configPath, "utf8");
const jsonData = JSON.parse(data);
const institutes = jsonData.institutes;
const createEvent = async function (req, res, next) {
  let {
    nome,
    data,
    resources,
    finalHour,
    initialHour,
    finalDate,
    initialDate,
    description,
    title,
    requested_by,
    responsible,
    requested_at,
    responsible_email,
    course, // Fix: Extract 'course' from the request body
  } = req.body;
  let courses = institutes.flatMap((institute) => institute.courses); // Fix: Flatten the array of courses
  let courseId = req.body.course; // Extract 'course' from the request body
  let selectedCourse = courses.find((course) => course.id == courseId);

  /* const allowedInstitutionalDomains = [
    "colegiocometa.com",
    "faifaculdade.com",
    "sesab.ba.gov.br",
    "irece.ba.gov.br",
    "saude.ba.gov.br",
  ];
  const userEmailDomain = responsible_email.split("@")[1];
  
  if (!allowedInstitutionalDomains.includes(userEmailDomain)) {
    // Renderizar a página de erro indicando que apenas e-mails institucionais são permitidos
    return res.render("error", {
      errorMessage: "Apenas e-mails institucionais são permitidos",
      moment: moment,
    });
  }
  */
  if (!selectedCourse) {
    return res.render("error");
  }

  const conflictingEvents = await Event.find({
    status: "Aprovado",
    $or: [
      {
        $and: [
          { initialDate: { $lte: finalDate } },
          { finalDate: { $gte: initialDate } },
          { initialHour: { $lte: finalHour } },
          { finalHour: { $gte: initialHour } },
        ],
      },
    ],
  });

  // If there are conflicting events, inform the user and handle accordingly

  if (conflictingEvents.length > 0) {
    //render the conflicting events

    return res.render("error", {
      conflictingEvents: conflictingEvents,
      moment: moment,
    });
  }

  // Update the following line to set 'responsible' to the name of the selected institute
  responsible = selectedCourse.name;
  // Criar um novo evento no banco de dados
  const event = new Event({
    nome,
    data,
    resources,
    initialHour: moment(initialHour, "HH:mm").format("HH:mm"),
    finalHour: moment(finalHour, "HH:mm").format("HH:mm"),
    initialDate: moment(initialDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
    finalDate: moment(finalDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
    description,
    title,
    requested_by,
    responsible: responsible,
    requested_at: Date.now(),
    responsible_email: responsible_email,
    coordinator: selectedCourse.coordinator, // Fix: Add 'coordinator' property
    manager: selectedCourse.manager, // Fix: Add 'manager' property
    manager_email: selectedCourse.managerEmail, // Fix: Add 'manager_email' property
    status: "Pendente",
  });
  // Salvar o evento no banco de dados
  console.log("Valores atribuídos ao modelo Event:", event);
  await event.save();
  const eventId = event._id;
  // Enviar e-mail com informações do agendamento
  sendEmail(
    eventId,
    initialHour,
    initialDate,
    title,
    requested_by,
    responsible,
    requested_at,
    resources,
    responsible_email,
    selectedCourse.coordinator,
    selectedCourse.manager || "N/A", // Use "N/A" if manager is undefined
    selectedCourse.coordinatorEmail,
    selectedCourse.managerEmail || "N/A", // Use "N/A" if managerEmail is undefined
    course.coordinatorEmail
  );

  res.redirect("/success");
};
const sudoCreateEvent = async function (req, res, next) {
  let {
    nome,
    data,
    resources,
    finalHour,
    initialHour,
    finalDate,
    initialDate,
    description,
    title,
    requested_by,
    responsible,
    requested_at,
    responsible_email,
    course, // Fix: Extract 'course' from the request body
  } = req.body;
  let courses = institutes.flatMap((institute) => institute.courses); // Fix: Flatten the array of courses
  let courseId = req.body.course; // Extract 'course' from the request body
  let selectedCourse = courses.find((course) => course.id == courseId);

  if (!selectedCourse) {
    return res.render("error");
  }

  const conflictingEvents = await Event.find({
    status: "Aprovado",
    $or: [
      {
        $and: [
          { initialDate: { $lte: finalDate } },
          { finalDate: { $gte: initialDate } },
          { initialHour: { $lte: finalHour } },
          { finalHour: { $gte: initialHour } },
        ],
      },
    ],
  });

  // If there are conflicting events, inform the user and handle accordingly

  if (conflictingEvents.length > 0) {
    //render the conflicting events

    return res.render("error", {
      conflictingEvents: conflictingEvents,
      moment: moment,
    });
  }

  // Update the following line to set 'responsible' to the name of the selected institute
  responsible = selectedCourse.name;
  // Criar um novo evento no banco de dados
  const event = new Event({
    nome,
    data,
    resources,
    initialHour: moment(initialHour, "HH:mm").format("HH:mm"),
    finalHour: moment(finalHour, "HH:mm").format("HH:mm"),
    initialDate: moment(initialDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
    finalDate: moment(finalDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
    description,
    title,
    requested_by,
    responsible: responsible,
    requested_at: Date.now(),
    responsible_email: responsible_email,
    coordinator: selectedCourse.coordinator, // Fix: Add 'coordinator' property
    manager: selectedCourse.manager, // Fix: Add 'manager' property
    manager_email: selectedCourse.managerEmail, // Fix: Add 'manager_email' property
    status: "Aprovado", //bypassing the approval process
  });
  // Salvar o evento no banco de dados
  await event.save();
  const eventId = event._id;
  // Enviar e-mail com informações do agendamento
  sudoSendEmail(
    eventId,
    initialHour,
    initialDate,
    title,
    requested_by,
    responsible,
    requested_at,
    resources,
    responsible_email,
    selectedCourse.coordinator,
    selectedCourse.manager || "N/A", // Use "N/A" if manager is undefined
    selectedCourse.coordinatorEmail,
    selectedCourse.managerEmail || "N/A", // Use "N/A" if managerEmail is undefined
    course.coordinatorEmail
  );

  res.redirect("/success");
};

// Função para enviar e-mail
const sendEmail = (
  eventId,
  initialHour,
  initialDate,
  title,
  requested_by,
  responsible,
  requested_at,
  resources,
  responsible_email,
  coordinatorName,
  managerName,
  coordinatorEmail,
  managerEmail
) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  let recipients = [coordinatorEmail, managerEmail, responsible_email];
  console.log(recipients);
  if (managerEmail) {
    recipients.push(managerEmail);
  }
  const link = `${process.env.BASE_URL}/status/${eventId}`;

  let mailOptions = {
    from: process.env.SMTP_SENDER,
    to: recipients.join(", "),
    subject: `${title} - Solicitação de Agendamento do auditório`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SAGES - Solicitação de Agendamento</title>
      </head>
      <body>
        <p>Uma nova solicitação de agendamento foi criada:</p>
        <p>Para visualizar o status do evento, clique no link abaixo:</p>
        <a href="${link}">${link}</a>
        <ul>
          <li><strong>Evento:</strong> ${title}</li>
          <li><strong>Coordenador:</strong> ${coordinatorName} (${coordinatorEmail})</li>
          <li><strong>Gerente:</strong> ${managerName} (${managerEmail})</li>
          <li><strong>Hora Inicial:</strong> ${moment(
            initialHour,
            "HH:mm"
          ).format("HH:mm")}</li>
          <li><strong>Data Inicial:</strong> ${moment(
            initialDate,
            "YYYY-MM-DD"
          ).format("DD/MM/YYYY")}</li>
          <li><strong>Título:</strong> ${title}</li>
          <li><strong>Solicitado por:</strong> ${requested_by}</li>
          <li><strong>Contato Solicitante:</strong> ${responsible_email}</li>
          <li><strong>Instituição-Curso Responsável:</strong> ${responsible}</li>
          <li><strong>Solicitado em:</strong> ${moment(requested_at).format(
            "DD/MM/YYYY HH:mm"
          )}</li>
          <li><strong>Recursos Extras Solicitados:</strong> ${resources}</li>
        </ul>
        <center>
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${link}" alt="qrcode" />
        </center>
        <p>Uma cópia dessa solicitação foi encaminhada ao solicitante: ${responsible_email}, bem como ao gerente de estruturas e eventos: ${managerName} - (${managerEmail}) e ao coordenador ${coordinatorName} - ${coordinatorName}.</p>
        <p>Atenciosamente,<br>Este é um email gerado automaticamente pelo sistema de agendamento de eventos do auditório. Em caso de dúvidas, entre em contato com o gerente de estruturas e eventos.</p>
            <footer>
          <p>Gerência de Estruturas e Eventos - Grupo Cometa de educação</p>
            </footer>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email enviado:", info.response);
    }
  });
};


const sudoSendEmail = (
  eventId,
  initialHour,
  initialDate,
  title,
  requested_by,
  responsible,
  requested_at,
  resources,
  responsible_email,
  coordinatorName,
  managerName,
  coordinatorEmail,
  managerEmail
) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  let recipients = [coordinatorEmail, managerEmail, responsible_email];
  console.log(recipients);
  if (managerEmail) {
    recipients.push(managerEmail);
  }
  const link = `${process.env.BASE_URL}/status/${eventId}`;

  let mailOptions = {
    from: process.env.SMTP_SENDER,
    to: recipients.join(", "),
    subject: `${title} - Confirmação de Agendamento do auditório`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SAGES - Confirmação de Agendamento</title>
      </head>
      <body>
        <p>Um novo evento foi agendado por um coordenador para o auditório:</p>
        <p>Para visualizar o status do evento, clique no link abaixo:</p>
        <a href="${link}">${link}</a>
        <ul>
          <li><strong>Evento:</strong> ${title}</li>
          <li><strong>Coordenador:</strong> ${coordinatorName} (${coordinatorEmail})</li>
          <li><strong>Gerente:</strong> ${managerName} (${managerEmail})</li>
          <li><strong>Hora Inicial:</strong> ${moment(
            initialHour,
            "HH:mm"
          ).format("HH:mm")}</li>
          <li><strong>Data Inicial:</strong> ${moment(
            initialDate,
            "YYYY-MM-DD"
          ).format("DD/MM/YYYY")}</li>
          <li><strong>Título:</strong> ${title}</li>
          <li><strong>Solicitado por:</strong> ${requested_by}</li>
          <li><strong>Contato Solicitante:</strong> ${responsible_email}</li>
          <li><strong>Instituição-Curso Responsável:</strong> ${responsible}</li>
          <li><strong>Solicitado em:</strong> ${moment(requested_at).format(
            "DD/MM/YYYY HH:mm"
          )}</li>
          <li><strong>Recursos Extras Solicitados:</strong> ${resources}</li>
        </ul>
        <center>
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${link}" alt="qrcode" />
        </center>
        <p>Uma cópia dessa solicitação foi encaminhada ao solicitante: ${responsible_email}, bem como ao gerente de estruturas e eventos: ${managerName} - (${managerEmail}) e ao coordenador ${coordinatorName} - ${coordinatorName}.</p>
        <p>Atenciosamente,<br>Este é um email gerado automaticamente pelo sistema de agendamento de eventos do auditório. Em caso de dúvidas, entre em contato com o gerente de estruturas e eventos.</p>
            <footer>
          <p>Gerência de Estruturas e Eventos - Grupo Cometa de educação</p>
            </footer>
        </body>
      </html>
    `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email enviado:", info.response);
    }
  });
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "Aprovado" });
    events.reverse();
    const formattedEvents = events.map((event) => ({
      ...event._doc,
      initialDate: moment(event.initialDate).format("DD/MM/YYYY"),
      finalDate: moment(event.finalDate).format("DD/MM/YYYY"),
      requested_at: moment(event.requested_at).format("DD/MM/YYYY HH:mm"),
    }));
    formattedEvents.reverse();
    res.render("index", { eventos: formattedEvents });
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "Aprovado" });
    events.reverse();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "Pendente" });
    events.reverse();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).send(error);
  }
};
const getRejectedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "Rejeitado" });
    events.reverse();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    events.reverse();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).send(error);
  }
};
const getForm = (req, res) => {
  const start = req.query.start;
  const end = req.query.end;
  const selectedInstituteId = req.query.institute; // Assuming the parameter name is "institute"
  const selectedCourseId = req.query.course; // Assuming the parameter name is "course"

  // Assuming you have a function to find the selected institute by ID
  const selectedInstitute = institutes.find(
    (institute) => institute.id == selectedInstituteId
  );

  // Pass the selected values to the rendering of the template
  res.render("agendar", {
    moment: moment,
    courses: institutes.courses,
    institutes: institutes,
    start: start,
    end: end,
    selectedInstitute: selectedInstitute,
    selectedCourseId: selectedCourseId,
  });
};

const getSudoForm = (req, res) => {
  const start = req.query.start;
  const end = req.query.end;
  const selectedInstituteId = req.query.institute; // Assuming the parameter name is "institute"
  const selectedCourseId = req.query.course; // Assuming the parameter name is "course"

  // Assuming you have a function to find the selected institute by ID
  const selectedInstitute = institutes.find(
    (institute) => institute.id == selectedInstituteId
  );

  // Pass the selected values to the rendering of the template
  res.render("sudo", {
    moment: moment,
    courses: institutes.courses,
    institutes: institutes,
    start: start,
    end: end,
    selectedInstitute: selectedInstitute,
    selectedCourseId: selectedCourseId,
  });
};

const getCalendar = async (req, res) => {
  try {
    const events = await Event.find();
    const formattedEvents = events.map((event) => ({
      title: event.title,
      start: moment(event.initialDate).format(),
      end: moment(event.finalDate).format(),
      description: event.description,
    }));

    res.render("calendar", { events: JSON.stringify(formattedEvents) });
  } catch (error) {
    res.status(500).send(error);
  }
};
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    res
      .status(403)
      .send(
        "Forbidden: You do not have enough permissions to perform this operation"
      );
  }
};

const getEvent = async (req, res) => {
  // Get the event ID from the request parameters
  const { id } = req.params;

  //get a single event from the database
  try {
    const event = await Event.findById(id);
    // Render the event json
    res.status(200).json(event);
  } catch (error) {
    res.render("error", { error: error });
  }
};

const mailResponse = async (req, res) => {
  const { to, subject, text } = req.body;
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.SMTP_SENDER,
      to: to,
      subject: subject,
      text: text,
    });
    console.log("Email enviado:", info);
    res.status(200).send({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ error: "Failed to send email" });
  }
};

// event_controller.js

const updateEventStatus = async (req, res) => {
  const id = req.params.id;
  const newStatus = req.body.status;
  const userFeedback = req.body.feedback;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).send({ message: "Evento não encontrado" });
    }

    // Trigger email only if the status is "Rejeitado"
    if (newStatus === "Rejeitado") {
      sendRejectionEmail(id, userFeedback);
    }

    if (newStatus === "Aprovado") {
      sendApprovalEmail(id);
    }

    res
      .status(200)
      .send({ message: "Status do evento atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar status do evento:", error);
    res.status(500).send(error);
  }
};

const sendRejectionEmail = async (eventId, userFeedback) => {
  try {
    // Retrieve event details from the database
    const event = await Event.findById(eventId);

    // Configure nodemailer transporter
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Define recipients and email content
    const recipient = event.responsible_email; // You can add more recipients if needed
    const link = `${process.env.BASE_URL}/status/${eventId}`;

    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: recipient,
      subject: `Evento Rejeitado: ${event.title}`,
      html: `
        <p>Infelizmente, o seu evento "${event.title}" foi rejeitado.</p>
        <p>Para mais detalhes, visite o link: <a href="${link}">${link}</a></p>
        <p>Feedback adicional: ${userFeedback}</p>
        <p>Se precisar de assistência, entre em contato.</p>
        <p>Atenciosamente,<br>Seu sistema de agendamento de eventos</p>
      `,
    };

    // Send the rejection email
    let info = await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully:", info);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};

const sendApprovalEmail = async (eventId) => {
  try {
    // Retrieve event details from the database
    const event = await Event.findById(eventId);

    // Configure nodemailer transporter
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Define recipients and email content
    const recipients = [event.responsible_email]; // You can add more recipients if needed
    const link = `${process.env.BASE_URL}/status/${eventId}`;

    const mailOptions = {
      from: process.env.SMTP_SENDER,
      to: recipients.join(", "),
      subject: `Evento Aprovado: ${event.title}`,
      html: `
        <p>Olá, o seu evento "${event.title}" foi aprovado pelo gerente rsponsável.</p>
        <p>Para mais detalhes, visite o link: <a href="${link}">${link}</a></p>
        <p>Se precisar de assistência, entre em contato.</p>
        <p>Atenciosamente,<br>SAGES</p>
      `,
    };

    // Send the approval email
    let info = await transporter.sendMail(mailOptions);
    console.log("Approval email sent successfully:", info);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
};

const renderEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const events = await Event.find({ _id: id });
    res.render("status", { events, moment });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  getForm,
  getSudoForm,
  sudoCreateEvent,
  renderEvent,
  getEvents,
  createEvent,
  getAprovedEvents,
  getPendingEvents,
  getAllEvents,
  getRejectedEvents,
  getCalendar,
  getEvent,
  mailResponse,
  isAdmin,
  updateEventStatus,
};
