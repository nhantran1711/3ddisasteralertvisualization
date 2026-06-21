export function filterEvents(events, disasterType) {
  if (!disasterType) return events; // Return all events if no disasterType is selected

  return events.filter((event) => {
    return event.categories === disasterType;
  });
}
