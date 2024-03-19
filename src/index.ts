import { Calendar } from '@fullcalendar/core';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';

window.Webflow ||= [];
window.Webflow.push(() => {
  const calendarElement = document.querySelector<HTMLDivElement>('[data-element="calendar"]');
  if (!calendarElement) return;

  const events = getEvents();
  console.log({ events });

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    //locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek',
    },
    events,
    dayCellClassNames: function (dateInfo) {
      const dateStr = dateInfo.date.toISOString().split('T')[0];
      if (!activeDates.has(dateStr)) {
        return ['no-event-day']; // Return a class for days without events
      }
      return []; // Return an empty array for days with events
    },
  });

  calendar.render();
});

const activeDates = new Set();

const getEvents = (): Event[] => {
  const scripts = document.querySelectorAll<HTMLScriptElement>('[data-element="event-data"]');

  const events = [...scripts].map((script) => {
    const event: Event = JSON.parse(script.textContent!);
    event.start = new Date(event.start);
    const endDate = new Date(event.end);
    // Adjust the end date for internal calculation but not for the activeDates inclusion
    event.end = new Date(endDate.setDate(endDate.getDate() + 1));
    event.title = htmlDecode(decodeURIComponent(event.title));

    // Populate activeDates for all days from start to end of the event, excluding the artificially added last day
    const currentDate = new Date(event.start);
    while (currentDate < event.end) {
      // Use < instead of <= to exclude the extra day
      activeDates.add(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return event;
  });

  return events;
};

function htmlDecode(input: string): string {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent!;
}
