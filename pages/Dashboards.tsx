import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Appointment, Doctor, Patient } from '../types';
import { mockService } from '../services/mockService';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatTimeDisplay, getTodayDateString, addDays } from '../utils';
import { Calendar, Users, Clock, Trash2, Plus, Edit2, X, Save, TrendingUp, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    NOSHOW: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

// --- Patient Dashboard ---
// Kept simple as per original design, focusing on Patient's own history
export const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    mockService.getAppointments().then(data => {
      const myAppts = data
        .filter(a => a.patientId === user?.id)
        .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
      setAppointments(myAppts);
    });
  }, [user]);

  const upcoming = appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'SCHEDULED');
  const past = appointments.filter(a => !upcoming.includes(a));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Hello, {user?.name}</h1>
        <p className="opacity-90">Welcome back. You have {upcoming.length} upcoming appointments.</p>
      </div>

      <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
      {upcoming.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map(apt => (
            <Card key={apt.id} className="border-l-4 border-l-primary-500">
              <CardBody>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{apt.doctorName}</h3>
                    <p className="text-sm text-gray-500">{apt.reason}</p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Calendar size={16} className="mr-2" />
                  <span className="mr-4">{apt.date}</span>
                  <Clock size={16} className="mr-2" />
                  <span>{formatTimeDisplay(apt.time)}</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No upcoming appointments scheduled.</p>
      )}

      <h2 className="text-xl font-bold text-gray-800 mt-8">Past History</h2>
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {past.map(apt => (
                <tr key={apt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{apt.doctorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={apt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// --- Doctor Dashboard ---
// Enhanced to show Today vs Next 7 Days
export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  const todayStr = getTodayDateString();
  const nextWeekStr = addDays(todayStr, 7);

  const refreshData = () => {
    mockService.getAppointments().then(data => {
      const myAppts = data.filter(a => a.doctorId === user?.id);
      setAppointments(myAppts);
    });
  };

  useEffect(() => { refreshData(); }, [user]);

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    if(confirm(`Mark appointment as ${status}?`)) {
      await mockService.updateAppointmentStatus(id, status);
      refreshData();
    }
  };

  // Filter Logic
  const todayAppointments = appointments
    .filter(a => a.date === todayStr && a.status === 'SCHEDULED')
    .sort((a,b) => a.time.localeCompare(b.time));

  const weekAppointments = appointments
    .filter(a => a.date > todayStr && a.date <= nextWeekStr && a.status === 'SCHEDULED')
    .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));

  const renderApptList = (list: Appointment[], emptyMsg: string) => {
    if (list.length === 0) return <p className="text-gray-500 italic p-4">{emptyMsg}</p>;
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map(apt => (
              <tr key={apt.id}>
                <td className="px-6 py-4 text-sm font-bold text-primary-700">
                  {formatTimeDisplay(apt.time)}
                  {apt.date !== todayStr && <div className="text-xs font-normal text-gray-500">{apt.date}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{apt.patientName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{apt.reason}</td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button onClick={() => handleStatusChange(apt.id, 'COMPLETED')} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">Done</button>
                  <button onClick={() => handleStatusChange(apt.id, 'NOSHOW')} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-2 py-1 rounded">No-Show</button>
                  <button onClick={() => handleStatusChange(apt.id, 'CANCELLED')} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <div className="text-sm text-gray-500">Today: {todayStr}</div>
      </div>
      
      {/* Today's Section */}
      <Card className="border-t-4 border-t-primary-500">
        <CardHeader className="bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Clock className="mr-2 text-primary-600" size={20} />
            Today's Appointments
          </h2>
        </CardHeader>
        {renderApptList(todayAppointments, "No appointments scheduled for today.")}
      </Card>

      {/* Week Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Calendar className="mr-2 text-gray-600" size={20} />
            Next 7 Days
          </h2>
        </CardHeader>
        {renderApptList(weekAppointments, "No upcoming appointments for the next week.")}
      </Card>
    </div>
  );
};

// --- Admin Dashboard ---
export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DOCTORS' | 'PATIENTS' | 'APPOINTMENTS'>('OVERVIEW');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Forms State
  const [isDocFormOpen, setIsDocFormOpen] = useState(false);
  const [isPatFormOpen, setIsPatFormOpen] = useState(false);
  const [editApptId, setEditApptId] = useState<string | null>(null);
  const [editApptData, setEditApptData] = useState({ date: '', time: '' });

  const loadAll = () => {
    Promise.all([mockService.getAppointments(), mockService.getDoctors(), mockService.getPatients()])
      .then(([appts, docs, pats]) => {
        setAppointments(appts);
        setDoctors(docs);
        setPatients(pats);
      });
  };

  useEffect(() => { loadAll(); }, []);

  // Handlers for Delete/Add are same as before...
  const handleDeleteDoctor = async (id: string) => { if (confirm('Delete doctor?')) { await mockService.deleteDoctor(id); loadAll(); } };
  const handleDeletePatient = async (id: string) => { if (confirm('Delete patient?')) { await mockService.deletePatient(id); loadAll(); } };
  
  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    await mockService.addDoctor({
      name: data.get('name') as string, email: data.get('email') as string, role: 'DOCTOR',
      specialization: data.get('spec') as string, phone: data.get('phone') as string,
      bio: 'New Doctor', consultationRoom: 'TBD', workingDays: [1,2,3,4,5], workingHours: { start: '09:00', end: '17:00' }
    });
    setIsDocFormOpen(false); loadAll();
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    await mockService.addPatient({
      name: data.get('name') as string, email: data.get('email') as string, phone: data.get('phone') as string,
      role: 'PATIENT', dob: '2000-01-01', gender: 'Other', address: 'Bangalore'
    });
    setIsPatFormOpen(false); loadAll();
  };

  const saveEditAppt = async () => {
    if (editApptId) {
      try {
        await mockService.updateAppointmentDetails(editApptId, editApptData.date, editApptData.time);
        setEditApptId(null); loadAll();
      } catch (e: any) { alert(e.message); }
    }
  };

  // Render Functions
  const renderOverview = () => {
    const todayStr = getTodayDateString();
    const weekEndStr = addDays(todayStr, 7);

    // Calc Stats
    const totalPatients = patients.length;
    const weeklyAppts = appointments.filter(a => a.date >= todayStr && a.date <= weekEndStr).length;
    const todayAppts = appointments.filter(a => a.date === todayStr && a.status === 'SCHEDULED').length;
    
    // Chart Data
    const statusData = [
      { name: 'Scheduled', value: appointments.filter(a => a.status === 'SCHEDULED').length, color: '#0ea5e9' },
      { name: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length, color: '#22c55e' },
      { name: 'Cancelled', value: appointments.filter(a => a.status === 'CANCELLED').length, color: '#ef4444' },
    ];

    const doctorPerformance = doctors.map(doc => ({
      name: doc.name.split(' ')[1],
      appointments: appointments.filter(a => a.doctorId === doc.id).length
    }));

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-50 border-blue-100">
            <CardBody className="flex items-center">
              <div className="p-3 bg-blue-200 text-blue-700 rounded-full mr-4"><Users size={24}/></div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-green-50 border-green-100">
            <CardBody className="flex items-center">
              <div className="p-3 bg-green-200 text-green-700 rounded-full mr-4"><Calendar size={24}/></div>
              <div>
                <p className="text-sm text-green-600 font-medium">This Week's Appts</p>
                <p className="text-3xl font-bold text-gray-900">{weeklyAppts}</p>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-purple-50 border-purple-100">
             <CardBody className="flex items-center">
              <div className="p-3 bg-purple-200 text-purple-700 rounded-full mr-4"><Clock size={24}/></div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Upcoming Today</p>
                <p className="text-3xl font-bold text-gray-900">{todayAppts}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="h-80">
            <CardHeader><h3 className="font-bold">Overall Status</h3></CardHeader>
            <CardBody className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card className="h-80">
            <CardHeader><h3 className="font-bold">Workload by Doctor</h3></CardHeader>
            <CardBody className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto w-full md:w-auto">
          {['OVERVIEW', 'DOCTORS', 'PATIENTS', 'APPOINTMENTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-2 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && renderOverview()}

      {activeTab === 'DOCTORS' && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="font-bold">Doctors Directory</h3>
            <Button size="sm" onClick={() => setIsDocFormOpen(true)}><Plus size={16} className="mr-1"/> Add New</Button>
          </CardHeader>
          <CardBody>
            {isDocFormOpen && (
              <form onSubmit={handleAddDoctor} className="mb-6 p-4 bg-gray-50 rounded-lg grid gap-4 grid-cols-1 md:grid-cols-2 border border-gray-200">
                <input name="name" placeholder="Doctor Name" required className="p-2 border rounded text-sm" />
                <input name="spec" placeholder="Specialization" required className="p-2 border rounded text-sm" />
                <input name="email" placeholder="Email" required className="p-2 border rounded text-sm" />
                <input name="phone" placeholder="Phone" required className="p-2 border rounded text-sm" />
                <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsDocFormOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Doctor</Button>
                </div>
              </form>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs text-gray-500">Details</th><th className="px-4 py-2"></th></tr></thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id} className="border-t">
                      <td className="px-4 py-3 text-sm font-medium">{doc.name}<br/><span className="text-xs text-gray-500 font-normal">{doc.specialization}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{doc.email}<br/>{doc.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'PATIENTS' && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="font-bold">Patient Records</h3>
            <Button size="sm" onClick={() => setIsPatFormOpen(true)}><Plus size={16} className="mr-1"/> Add New</Button>
          </CardHeader>
          <CardBody>
            {isPatFormOpen && (
              <form onSubmit={handleAddPatient} className="mb-6 p-4 bg-gray-50 rounded-lg grid gap-4 grid-cols-1 md:grid-cols-2 border border-gray-200">
                <input name="name" placeholder="Patient Name" required className="p-2 border rounded text-sm" />
                <input name="email" placeholder="Email" required className="p-2 border rounded text-sm" />
                <input name="phone" placeholder="Phone" required className="p-2 border rounded text-sm" />
                <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsPatFormOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Patient</Button>
                </div>
              </form>
            )}
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs text-gray-500">Contact</th><th className="px-4 py-2"></th></tr></thead>
                <tbody>
                  {patients.map(pat => (
                    <tr key={pat.id} className="border-t">
                      <td className="px-4 py-3 text-sm font-medium">{pat.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{pat.email}<br/>{pat.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeletePatient(pat.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'APPOINTMENTS' && (
        <Card>
          <CardHeader><h3 className="font-bold">Master Appointment List</h3></CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient & Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map(apt => (
                  <tr key={apt.id}>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold text-gray-900">{apt.patientName}</div>
                      <div className="text-gray-500 text-xs">Dr. {apt.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {editApptId === apt.id ? (
                        <div className="flex flex-col gap-1">
                          <input type="date" className="border p-1 text-xs rounded" value={editApptData.date} onChange={e => setEditApptData({...editApptData, date: e.target.value})} />
                          <input type="time" className="border p-1 text-xs rounded" value={editApptData.time} onChange={e => setEditApptData({...editApptData, time: e.target.value})} />
                        </div>
                      ) : (
                        <div>{apt.date} <br/> <span className="text-xs font-medium bg-gray-100 px-1 rounded">{formatTimeDisplay(apt.time)}</span></div>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {editApptId === apt.id ? (
                        <div className="flex space-x-2">
                           <button onClick={saveEditAppt} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={18}/></button>
                           <button onClick={() => setEditApptId(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><X size={18}/></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditApptId(apt.id); setEditApptData({ date: apt.date, time: apt.time }); }} className="text-primary-600 hover:text-primary-900 hover:bg-primary-50 p-1 rounded"><Edit2 size={18}/></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};