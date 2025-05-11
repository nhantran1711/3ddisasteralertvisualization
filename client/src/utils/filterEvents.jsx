export function filterEvents(events, disasterType) {
  if (!disasterType) return events; // Return all events if no disasterType is selected

  return events.filter((event) => {
    const eventType = event.categories?.[0]?.title || '';
    return eventType === disasterType; // Filter by disaster type
  });
}
