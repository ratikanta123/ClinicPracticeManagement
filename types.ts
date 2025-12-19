export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface Patient extends User {
  role: 'PATIENT';
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
}

export interface Doctor extends User {
  role: 'DOCTOR';
  specialization: string;
  bio: string;
  consultationRoom: string;
  workingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
}

export interface Admin extends User {
  role: 'ADMIN';
}

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string; // Denormalized for easier display
  patientName: string; // Denormalized for easier display
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}