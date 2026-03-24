export const parkingData = {
  mallName: "SM DOWNTOWN",
  locationName: "PARKING AREA",
  totalSlots: 480,
  occupiedSlots: 352,
  availableSlots: 128,
  levelsCovered: 4,
  dailyEntries: 2147,
  avgTurnoverMinutes: 96,
  predictedPeakOccupancy: "88% at 5:30 PM",
  lastUpdated: "February 20, 2026, 10:30 AM",
  supervisor: {
    name: "Jamie Cruz",
    role: "Parking Operations Supervisor",
    shift: "Morning Shift",
  },
};

export const metrics = [
  {
    id: "total",
    title: "Total Slots",
    value: parkingData.totalSlots,
    subtitle: "Across all covered levels",
  },
  {
    id: "occupied",
    title: "Occupied",
    value: parkingData.occupiedSlots,
    subtitle: "Vehicles currently parked",
    status: "Occupied",
  },
  {
    id: "available",
    title: "Available",
    value: parkingData.availableSlots,
    subtitle: "Ready for incoming drivers",
    status: "Available",
  },
  {
    id: "turnover",
    title: "Avg Turnover",
    value: `${parkingData.avgTurnoverMinutes} min`,
    subtitle: "Average slot re-use time",
  },
];

export const slotStatus = [
  { slotId: "N1-021", level: "Level 1", status: "Occupied", plateNumber: "NEX-4821" },
  { slotId: "N1-028", level: "Level 1", status: "Available", plateNumber: "-" },
  { slotId: "N2-112", level: "Level 2", status: "Occupied", plateNumber: "GMA-1048" },
  { slotId: "N3-206", level: "Level 3", status: "Available", plateNumber: "-" },
  { slotId: "N4-014", level: "Level 4", status: "Occupied", plateNumber: "TKR-2290" },
];

export const sensorStatus = [
  { id: "SEN-CAM-01", zone: "North Gate", health: "Online", latencyMs: 36 },
  { id: "SEN-IR-14", zone: "Level 2 East", health: "Online", latencyMs: 43 },
  { id: "SEN-IR-22", zone: "Level 3 West", health: "Warning", latencyMs: 118 },
  { id: "SEN-CAM-09", zone: "Exit Ramp", health: "Online", latencyMs: 39 },
  { id: "SEN-LOOP-05", zone: "Basement Entry", health: "Offline", latencyMs: null },
];

export const notifications = [
  { id: 1, message: "Camera 2 resumed sync after 08:45 AM interruption.", type: "info" },
  { id: 2, message: "Sensor SEN-LOOP-05 is offline. Dispatch technician.", type: "critical" },
  { id: 3, message: "Level 2 occupancy crossed 85% threshold.", type: "warning" },
];

export const entranceDisplay = {
  title: "Entrance LED Display",
  primaryMessage: "128 SLOTS AVAILABLE",
  secondaryMessage: "Levels 1 and 3 have fastest access",
  updatedAt: "Updated 10 seconds ago",
};

export const parkingGuidanceAreas = [
  { id: "north", label: "North Wing", availableSlots: 46, status: "Open" },
  { id: "central", label: "Central Deck", availableSlots: 18, status: "Limited" },
  { id: "south", label: "South Wing", availableSlots: 0, status: "Full" },
  { id: "vip", label: "VIP Zone", availableSlots: 7, status: "Open" },
];

export const activityHistory = [
  {
    id: "hist-1",
    time: "10:30 AM",
    message: "Entrance display refreshed to 128 available slots.",
    type: "info",
  },
  {
    id: "hist-2",
    time: "10:26 AM",
    message: "North Wing released 12 slots after morning batch exit.",
    type: "stable",
  },
  {
    id: "hist-3",
    time: "10:24 AM",
    message: "Central Deck changed from open to limited availability.",
    type: "warning",
  },
  {
    id: "hist-4",
    time: "10:21 AM",
    message: "South Wing reached full occupancy.",
    type: "critical",
  },
];
