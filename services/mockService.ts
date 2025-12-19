import { User, Doctor, Patient, Appointment, Role, Admin } from '../types';

// Initial Mock Data
const MOCK_ADMIN: Admin = {
  id: 'admin-1',
  name: 'Rajesh Kumar',
  email: 'admin@clinic.com',
  role: 'ADMIN',
  phone: '9876543210'
};

let MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Anita Sharma',
    email: 'anita@clinic.com',
    role: 'DOCTOR',
    specialization: 'Cardiologist',
    phone: '9876511111',
    bio: 'Senior Cardiologist with 15 years of experience.',
    consultationRoom: 'Room 101',
    workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    workingHours: { start: '09:00', end: '17:00' }
  },
  {
    id: 'doc-2',
    name: 'Dr. Vikram Singh',
    email: 'vikram@clinic.com',
    role: 'DOCTOR',
    specialization: 'Pediatrician',
    phone: '9876522222',
    bio: 'Specialist in child nutrition.',
    consultationRoom: 'Room 202',
    workingDays: [1, 3, 5],
    workingHours: { start: '10:00', end: '18:00' }
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Desai',
    email: 'priya@clinic.com',
    role: 'DOCTOR',
    specialization: 'General Physician',
    phone: '9876533333',
    bio: 'Expert in managing chronic conditions.',
    consultationRoom: 'Room 103',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: { start: '09:00', end: '17:00' }
  }
];

let MOCK_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Rahul Verma',
    email: 'rahul@gmail.com',
    role: 'PATIENT',
    phone: '9988776655',
    dob: '1990-05-15',
    gender: 'Male',
    address: '12, MG Road, Bangalore'
  },
  {
    id: 'pat-2',
    name: 'Sneha Gupta',
    email: 'sneha@gmail.com',
    role: 'PATIENT',
    phone: '9988777777',
    dob: '1995-08-20',
    gender: 'Female',
    address: '45, Indiranagar, Bangalore'
  }
];

const today = new Date().toISOString().split('T')[0];
let MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    doctorId: 'doc-1',
    doctorName: 'Dr. Anita Sharma',
    patientName: 'Rahul Verma',
    date: today,
    time: '10:00',
    reason: 'Regular Checkup',
    status: 'SCHEDULED',
    createdAt: new Date().toISOString()
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // --- Auth & OTP ---
  login: async (identifier: string, role: Role): Promise<User | null> => {
    await delay(500);
    // Allow login by Email OR Phone
    const check = (u: User) => u.email === identifier || u.phone === identifier;

    if (role === 'ADMIN' && (identifier === MOCK_ADMIN.email || identifier === MOCK_ADMIN.phone)) return MOCK_ADMIN;
    if (role === 'DOCTOR') return MOCK_DOCTORS.find(check) || null;
    if (role === 'PATIENT') return MOCK_PATIENTS.find(check) || null;
    return null;
  },

  sendOTP: async (identifier: string): Promise<boolean> => {
    await delay(800);
    console.log(`[MockService] OTP sent to ${identifier}: 1234`);
    return true; 
  },

  verifyOTP: async (identifier: string, code: string): Promise<boolean> => {
    await delay(500);
    return code === '1234';
  },

  registerUser: async (user: Omit<Patient, 'id'>): Promise<Patient> => {
    await delay(600);
    const newPatient = { ...user, id: `pat-${Date.now()}` };
    MOCK_PATIENTS.push(newPatient as Patient);
    return newPatient as Patient;
  },

  // --- Data Access ---
  getDoctors: async (): Promise<Doctor[]> => {
    await delay(300);
    return [...MOCK_DOCTORS];
  },

  getPatients: async (): Promise<Patient[]> => {
    await delay(300);
    return [...MOCK_PATIENTS];
  },

  getAppointments: async (): Promise<Appointment[]> => {
    await delay(300);
    return [...MOCK_APPOINTMENTS];
  },

  // --- Doctor Management ---
  addDoctor: async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
    await delay(500);
    const newDoc = { ...doctor, id: `doc-${Date.now()}` };
    MOCK_DOCTORS.push(newDoc as Doctor);
    return newDoc as Doctor;
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await delay(300);
    MOCK_DOCTORS = MOCK_DOCTORS.filter(d => d.id !== id);
    MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.filter(a => a.doctorId !== id);
  },

  // --- Patient Management ---
  addPatient: async (patient: Omit<Patient, 'id'>): Promise<Patient> => {
    await delay(500);
    const newPat = { ...patient, id: `pat-${Date.now()}` };
    MOCK_PATIENTS.push(newPat as Patient);
    return newPat as Patient;
  },

  deletePatient: async (id: string): Promise<void> => {
    await delay(300);
    MOCK_PATIENTS = MOCK_PATIENTS.filter(p => p.id !== id);
    MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.filter(a => a.patientId !== id);
  },

  // --- Appointment Management ---
  createAppointment: async (appt: Omit<Appointment, 'id' | 'createdAt' | 'doctorName' | 'patientName'>): Promise<Appointment> => {
    await delay(600);
    
    // Check double booking
    const isTaken = MOCK_APPOINTMENTS.some(
      a => a.doctorId === appt.doctorId && a.date === appt.date && a.time === appt.time && a.status !== 'CANCELLED'
    );
    
    if (isTaken) {
      throw new Error("Oh no! That time slot was just booked by someone else. Please choose another time.");
    }

    const doctor = MOCK_DOCTORS.find(d => d.id === appt.doctorId);
    const patient = MOCK_PATIENTS.find(p => p.id === appt.patientId);

    if (!doctor || !patient) throw new Error("System error: Invalid doctor or patient ID");

    const newAppt: Appointment = {
      ...appt,
      id: `apt-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      doctorName: doctor.name,
      patientName: patient.name
    };
    MOCK_APPOINTMENTS.push(newAppt);
    return newAppt;
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status']): Promise<void> => {
    await delay(300);
    const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id);
    if (idx !== -1) {
      MOCK_APPOINTMENTS[idx].status = status;
    }
  },

  updateAppointmentDetails: async (id: string, date: string, time: string): Promise<void> => {
    await delay(400);
    const idx = MOCK_APPOINTMENTS.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Appointment not found");
    
    const current = MOCK_APPOINTMENTS[idx];
    const isTaken = MOCK_APPOINTMENTS.some(
      a => a.id !== id && 
      a.doctorId === current.doctorId && 
      a.date === date && 
      a.time === time && 
      a.status !== 'CANCELLED'
    );

    if (isTaken) throw new Error("That slot is already busy. Please pick another time.");

    MOCK_APPOINTMENTS[idx].date = date;
    MOCK_APPOINTMENTS[idx].time = time;
  }
};