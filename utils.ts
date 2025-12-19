import { Doctor } from './types';

export const TIME_SLOT_INTERVAL = 30; // minutes

// --- Time Slot Generation ---

export function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  let current = parseTime(start);
  const endTime = parseTime(end);

  while (current < endTime) {
    slots.push(formatTime(current));
    current = addMinutes(current, TIME_SLOT_INTERVAL);
  }
  return slots;
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function addMinutes(minutes: number, add: number): number {
  return minutes + add;
}

// --- Formatting ---

export function formatDateToIST(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Convert "14:30" to "02:30 PM"
export function formatTimeDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

// --- Availability Logic ---

export function getAvailableSlots(
  doctor: Doctor,
  dateStr: string, // YYYY-MM-DD
  appointments: import('./types').Appointment[]
): { time: string; isAvailable: boolean }[] {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0-6
  
  // Check if doctor works on this day of week
  if (!doctor.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const allSlots = generateTimeSlots(doctor.workingHours.start, doctor.workingHours.end);
  
  return allSlots.map(time => {
    // Check if slot is taken in existing appointments
    const isTaken = appointments.some(
      a => a.doctorId === doctor.id && 
           a.date === dateStr && 
           a.time === time && 
           a.status !== 'CANCELLED'
    );
    return { time, isAvailable: !isTaken };
  });
}

// --- Dashboard Helpers ---

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const result = new Date(dateStr);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}