async function fetchAndDisplayEvents() {
  try {
    const response = await fetch("/events-all");
    if (!response.ok) {
      throw new Error(`Failed to fetch events. Status: ${response.status}`);
    }

    const events = await response.json();

    // Sort events by status (pending first)
    events.sort((a, b) => {
      if (a.status === "Pendente" && b.status !== "Pendente") return -1;
      if (b.status === "Pendente" && a.status !== "Pendente") return 1;
      return 0;
    });

    events.forEach((event) => {
      const row = document.createElement("tr");

      const titleCell = document.createElement("td");
      titleCell.textContent = event.title;
      row.appendChild(titleCell);

      const dateCell = document.createElement("td");
      dateCell.textContent = event.initialDate;
      row.appendChild(dateCell);

      const statusCell = document.createElement("td");
      statusCell.textContent = event.status;
      row.appendChild(statusCell);

      if (event.status === "Pendente") {
        const actionCell = document.createElement("td");
        const approveButton = createButton("Aprovar", () =>
          showConfirmationModal(event, "approve")
        );
        const rejectButton = createButton("Rejeitar", () =>
          showConfirmationModal(event, "reject")
        );
        const detailsButton = createButton("Detalhes", () =>
          showDetailsModal(event)
        );

        actionCell.appendChild(approveButton);
        actionCell.appendChild(rejectButton);
        actionCell.appendChild(detailsButton);

        row.appendChild(actionCell);
      }

      if (event.status === "Aprovado") {
        const actionCell = document.createElement("td");
        const chatButton = createButton("Chat", () => showChatSection(event));
        document
          .getElementById("approvedEventsTable")
          .querySelector("tbody")
          .appendChild(row);
      } else if (event.status === "Rejeitado") {
        document
          .getElementById("rejectedEventsTable")
          .querySelector("tbody")
          .appendChild(row);
      } else {
        document
          .getElementById("pendingEventsTable")
          .querySelector("tbody")
          .appendChild(row);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

function createButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function showConfirmationModal(event, action) {
  const modal = document.getElementById("eventModal");
  const confirmButton = document.getElementById("confirmButton");
  const feedbackInput = document.getElementById("feedbackInput");
  const modalTitle = document.getElementById("modalTitle");
  const chatSection = document.getElementById("chatSection");

  modalTitle.textContent = `Confirm ${
    action.charAt(0).toUpperCase() + action.slice(1)
  } Event`;
  confirmButton.onclick = async () => {
    closeModal();

    if (action === "approve") {
      // Handle approval logic here
      await performAction("/approve-event", event.id);
    } else if (action === "reject") {
      // Handle rejection logic here
      const feedback = feedbackInput.value;
      await performAction("/reject-event", event.id, feedback);
    }
  };

  // Hide chat section in confirmation modal
  chatSection.style.display = "none";

  // Show the modal
  modal.style.display = "block";
}

function showDetailsModal(event) {
  const modal = document.getElementById("eventModal");
  const confirmButton = document.getElementById("confirmButton");
  const feedbackInput = document.getElementById("feedbackInput");
  const modalTitle = document.getElementById("modalTitle");
  const chatSection = document.getElementById("chatSection");

  // Customize modal content to display event details
  const detailsContent = document.getElementById("eventDetails");
  detailsContent.innerHTML = `
      <p><strong>Título:</strong> ${event.title}</p>
      <p><strong>Data:</strong> ${event.initialDate}</p>
      <p><strong>Status:</strong> ${event.status}</p>
    `;

  // Hide chat section in details modal
  chatSection.style.display = "none";

  // Show the modal
  modal.style.display = "block";
}

function showChatSection(event) {
  const modal = document.getElementById("eventModal");
  const confirmButton = document.getElementById("confirmButton");
  const feedbackInput = document.getElementById("feedbackInput");
  const modalTitle = document.getElementById("modalTitle");
  const chatSection = document.getElementById("chatSection");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendButton");

  modalTitle.textContent = "Chat";
  confirmButton.style.display = "none"; // Hide confirmation button for chat modal
  feedbackInput.style.display = "none"; // Hide feedback input for chat modal

  // Show chat section
  chatSection.style.display = "block";

  // Display chat messages (dummy messages for illustration)
  chatMessages.innerHTML = `
      <p>User: Hi, can you provide more details about the event?</p>
      <p>Bot: Sure! The event is...</p>
    `;

  // Enable sending messages
  sendButton.onclick = () => {
    const userMessage = chatInput.value;
    if (userMessage.trim() !== "") {
      // Display user message
      chatMessages.innerHTML += `<p>User: ${userMessage}</p>`;
      // Handle bot response (dummy response for illustration)
      setTimeout(() => {
        chatMessages.innerHTML += `<p>Bot: Thanks for your message! The event details are...</p>`;
      }, 500);
    }
    // Clear input after sending message
    chatInput.value = "";
  };

  // Show the modal
  modal.style.display = "block";
}

async function performAction(url, eventId, feedback = null) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventId, feedback }),
    });

    if (!response.ok) {
      throw new Error(`Failed to perform action. Status: ${response.status}`);
    }

    // Refresh the events after action
    fetchAndDisplayEvents();
  } catch (error) {
    console.error(error);
  }
}

function closeModal() {
  const modal = document.getElementById("eventModal");
  modal.style.display = "none";
}

window.onload = fetchAndDisplayEvents;
