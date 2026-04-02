const generateICS = (event) => {
  const formatDate = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr || '00:00:00'}`);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventHub//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.event_date, event.start_time)}`,
    `DTEND:${formatDate(event.event_date, event.end_time || '23:59:59')}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.venue || ''}`,
    `UID:${event.id}@eventhub.com`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
  link.click();
};

const generateGoogleCalendarUrl = (event) => {
  const formatDate = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr || '00:00:00'}`);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    details: event.description || '',
    location: event.venue || '',
    dates: `${formatDate(event.event_date, event.start_time)}/${formatDate(event.event_date, event.end_time || '23:59:59')}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export { generateICS, generateGoogleCalendarUrl };
