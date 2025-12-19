import React, { useEffect, useState } from 'react';
import { Doctor, Appointment } from '../types';
import { mockService } from '../services/mockService';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getAvailableSlots, formatTimeDisplay } from '../utils';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, MapPin, Clock, ArrowLeft, Calendar, User as UserIcon } from 'lucide-react';

// Steps definition
const STEPS = [
  { id: 1, title: 'Choose Doctor' },
  { id: 2, title: 'Choose Time' },
  { id: 3, title: 'Your Details' },
  { id: 4, title: 'Confirm' }
];

const PatientBooking: React.FC = () => {
  const { user } = useAuth();
  
  // Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Flow State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Initial Data Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [docs, appts] = await Promise.all([
      mockService.getDoctors(),
      mockService.getAppointments()
    ]);
    setDoctors(docs);
    setAppointments(appts);
    setIsLoading(false);
  };

  // 2. Actions
  const handleSelectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setCurrentStep(2);
    setErrorMsg('');
  };

  const handleSelectTime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep(3);
    setErrorMsg('');
  };

  const handleSubmitBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !user) return;
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      await mockService.createAppointment({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        reason: reason || 'General Consultation',
        status: 'SCHEDULED'
      });
      setCurrentStep(4); // Success
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to book. Please try again.");
      // Refresh slots in background in case of collision
      loadData();
      setCurrentStep(2); // Go back to time selection
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setErrorMsg('');
  };

  // 3. Render Steps

  // Step 1: Doctor List
  const renderDoctorSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map(doc => (
        <Card key={doc.id} className="cursor-pointer hover:shadow-md transition-all border-l-4 border-l-transparent hover:border-l-primary-500">
          <CardBody>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                  {doc.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{doc.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{doc.specialization}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
               <p className="flex items-center"><Clock size={14} className="mr-2"/> {formatTimeDisplay(doc.workingHours.start)} - {formatTimeDisplay(doc.workingHours.end)}</p>
               <p className="flex items-center"><MapPin size={14} className="mr-2"/> {doc.consultationRoom}</p>
            </div>
            <Button className="mt-4 w-full" variant="outline" onClick={() => handleSelectDoctor(doc)}>
              Select Doctor
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  // Step 2: Date & Time
  const renderTimeSelection = () => {
    if (!selectedDoctor) return null;
    const today = new Date().toISOString().split('T')[0];
    // Calculate slots if date is selected
    const availableSlots = selectedDate ? getAvailableSlots(selectedDoctor, selectedDate, appointments) : [];

    return (
      <div className="space-y-6">
        <Card>
          <CardBody>
            <h3 className="font-bold text-lg mb-4">Pick a Date</h3>
            <input 
              type="date" 
              min={today}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </CardBody>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader><h3 className="font-bold">Available Slots (IST)</h3></CardHeader>
            <CardBody>
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <p>No slots available on this date.</p>
                  <p className="text-sm">Please select another date or doctor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map(({ time, isAvailable }) => (
                    <button
                      key={time}
                      disabled={!isAvailable}
                      onClick={() => handleSelectTime(selectedDate, time)}
                      className={`
                        p-3 rounded-lg text-sm font-medium transition-all
                        ${isAvailable 
                          ? 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-600 hover:text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-transparent'}
                      `}
                    >
                      {formatTimeDisplay(time)}
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  // Step 3: Details
  const renderDetails = () => (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <h3 className="font-bold text-lg">Confirm Appointment Details</h3>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="bg-primary-50 p-4 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Doctor:</span>
            <span className="font-bold text-gray-900">{selectedDoctor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-bold text-gray-900">{selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-bold text-gray-900">{selectedTime ? formatTimeDisplay(selectedTime) : ''}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit (Optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. High fever since yesterday..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            rows={3}
          />
        </div>

        <Button fullWidth onClick={handleSubmitBooking} disabled={isLoading} size="lg">
          {isLoading ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </CardBody>
    </Card>
  );

  // Step 4: Success
  const renderSuccess = () => (
    <div className="text-center py-12 max-w-lg mx-auto">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-8">
        Your appointment with {selectedDoctor?.name} is set for {selectedDate} at {selectedTime ? formatTimeDisplay(selectedTime) : ''}.
      </p>
      <div className="space-x-4">
        <Button onClick={resetFlow}>Book Another</Button>
        <Button variant="outline" onClick={() => window.location.hash = '#/'}>Go to Dashboard</Button>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header & Back Button */}
      <div className="flex items-center mb-6">
        {currentStep > 1 && currentStep < 4 && (
          <button onClick={() => setCurrentStep(prev => prev - 1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          {STEPS.find(s => s.id === currentStep)?.title}
        </h1>
      </div>

      {/* Progress Bar */}
      {currentStep < 4 && (
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.slice(0, 3).map((step) => (
              <span key={step.id} className={`text-xs font-semibold uppercase tracking-wider ${currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'}`}>
                {step.id}. {step.title}
              </span>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-300 ease-out"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <div className="mr-3 mt-1">⚠️</div>
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && renderDoctorSelection()}
        {currentStep === 2 && renderTimeSelection()}
        {currentStep === 3 && renderDetails()}
        {currentStep === 4 && renderSuccess()}
      </div>
    </div>
  );
};

export default PatientBooking;