moment.locale("pt-br");

$(document).ready(function () {
  var calendar = $("#calendar");
  var loadingIndicator = $(".loading-indicator");
  function showEventDetails(event) {
    $("#eventModalLabel").text(event.title);
    $(".modal-body").html(`
      <p>De: ${event.start}</p>
      <p>Até: ${event.end}</p>
      <p>Descrição: ${event.description}</p>
      <p>Recursos: ${event.resources}</p>
      <p>Instituição responsável: ${event.responsible}</p>

      `);
    $("#eventModal").modal("show");
  }
  function getEventColor(index) {
    var colors = ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8"];
    return colors[index % colors.length];
  }

  function isDateValid(start) {
    const minDate = moment().add(7, "days");
    return start.isSameOrAfter(minDate, "day");
  }

  $.ajax({
    url: "/aproved-events",
    type: "GET",
    dataType: "json",
    beforeSend: function () {
      loadingIndicator.show();
    },
    success: function (response) {
      loadingIndicator.hide();

      var events = response.map(function (event, index) {
        return {
          title: event.title,
          start: moment(
            event.initialDate + " " + event.initialHour,
            "YYYY-MM-DD HH:mm"
          ).format(),
          end: moment(
            event.finalDate + " " + event.finalHour,
            "YYYY-MM-DD HH:mm"
          ).format(),
          description: event.description,
          responsible: event.responsible,
          color: getEventColor(index),
        };
      });

      calendar.fullCalendar({
        header: {
          left: "prev,next today",
          center: "title",
          right: "month,agendaWeek,agendaDay,list",
        },

        slotDuration: "01:00:00",
        minTime: "08:00:00",
        maxTime: "22:00:00",
        events: events,
        selectable: true,
        select: function (start, end) {
          if (isDateValid(start)) {
            window.location.href =
              "/agendar?start=" + start.format() + "&end=" + end.format();
          } else {
            alert("Selecione uma data a partir de 7 dias da data atual.");
            calendar.fullCalendar("unselect");
          }
        },
        eventClick: function (calEvent, jsEvent, view) {
          showEventDetails(calEvent);
        },
        dateClick: function (date, jsEvent, view) {
          if (isDateValid(date)) {
            window.location.href = "/agendar?start=" + date.format();
          } else {
            alert("Selecione uma data a partir de 7 dias da data atual.");
          }
        },
        eventRender: function (event, element) {
          element
            .find(".fc-title")
            .append(
              '<br/><span class="responsible-info">' +
                event.responsible +
                "</span>"
            );
        },
        locale: "pt-br",
      });

      // Replace click event listener with touchend event listener for mobile devices
      calendar.on("touchend", ".fc-content", function () {
        calendar.fullCalendar("eventClick", calEvent, jsEvent, view);
      });
    },
    error: function (error) {
      loadingIndicator.hide();
      console.error("Erro ao buscar eventos:", error);
    },
  });

  // Touch event listener for mobile devices
  calendar.on("touchend", ".fc-content", function (e) {
    var calEvent = calendar.fullCalendar(
      "clientEvents",
      $(this).data("fc-segment").event.id
    )[0];
    var jsEvent = e.originalEvent;
    var view = calendar.fullCalendar("getView");

    calendar.fullCalendar("eventClick", calEvent, jsEvent, view);
  });

  // Replace click event listener with touchstart event listener for mobile devices
  $("#export-pdf").on("click", function () {
    window.print();
  });
  $("#new-event").on("click", function () {
    window.location.href = "/agendar";
  });
});
