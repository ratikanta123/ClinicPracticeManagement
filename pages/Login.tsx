import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Role } from '../types';
import { mockService } from '../services/mockService';

const Login: React.FC = () => {
  const { login, register, error: authError, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<Role>('PATIENT');
  
  // Login State
  const [identifier, setIdentifier] = useState(''); // Email or Phone

  // Registration State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');

  const demoAccounts = {
    PATIENT: 'rahul@gmail.com',
    DOCTOR: 'anita@clinic.com',
    ADMIN: 'admin@clinic.com'
  };

  const resetState = () => {
    setLocalError('');
    setOtpSent(false);
    setOtp('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(identifier, role);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!regForm.name || !regForm.phone || !regForm.email) {
      setLocalError('Please fill in Name, Phone and Email to verify.');
      return;
    }

    try {
      await mockService.sendOTP(regForm.phone);
      setOtpSent(true);
      alert(`OTP sent to ${regForm.phone} (Use 1234)`);
    } catch (e) {
      setLocalError('Failed to send OTP');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const verified = await mockService.verifyOTP(regForm.phone, otp);
    if (!verified) {
      setLocalError('Invalid OTP');
      return;
    }

    await register({
      ...regForm,
      role: 'PATIENT'
    });
  };

  const InputField = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`w-full px-3 py-3 bg-transparent border-b-2 border-gray-300 focus:border-primary-600 focus:outline-none transition-colors placeholder-gray-400 text-gray-900 ${props.className}`}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary-600 text-white text-3xl font-bold mb-4">
            H
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HealthPulse India</h1>
          <p className="text-gray-500 mt-2">Practice Management System</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
          <CardBody>
            {/* Header / Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
              <button
                onClick={() => { setIsRegistering(false); resetState(); }}
                className={`flex-1 pb-2 text-sm font-semibold transition-colors ${!isRegistering ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegistering(true); setRole('PATIENT'); resetState(); }}
                className={`flex-1 pb-2 text-sm font-semibold transition-colors ${isRegistering ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}
              >
                New Registration
              </button>
            </div>

            {(authError || localError) && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {authError || localError}
              </div>
            )}

            {!isRegistering ? (
              // --- LOGIN FORM ---
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="flex justify-center space-x-4 mb-4">
                  {(['PATIENT', 'DOCTOR', 'ADMIN'] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setIdentifier(demoAccounts[r]); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        role === r 
                          ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                          : 'bg-gray-100 text-gray-500 border border-transparent'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Email or Mobile Number</label>
                  <InputField
                    type="text"
                    placeholder="Enter email or 10-digit mobile"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>

                <Button type="submit" fullWidth disabled={isLoading} variant="primary" className="py-3">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  Clinic Timing: 9:00 AM - 5:00 PM IST
                </p>
              </form>
            ) : (
              // --- REGISTER FORM ---
              <form onSubmit={otpSent ? handleRegister : handleSendOTP} className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <InputField
                        type="text"
                        placeholder="Full Name"
                        required
                        value={regForm.name}
                        onChange={(e) => setRegForm({...regForm, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <InputField
                        type="email"
                        placeholder="Email Address"
                        required
                        value={regForm.email}
                        onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <InputField
                        type="tel"
                        placeholder="Mobile Number (10 digits)"
                        required
                        pattern="[0-9]{10}"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                         <InputField
                          type="date"
                          required
                          value={regForm.dob}
                          onChange={(e) => setRegForm({...regForm, dob: e.target.value})}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Gender</label>
                        <select 
                          className="w-full px-3 py-3 bg-transparent border-b-2 border-gray-300 focus:border-primary-600 focus:outline-none"
                          value={regForm.gender}
                          onChange={(e) => setRegForm({...regForm, gender: e.target.value as any})}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <InputField
                        type="text"
                        placeholder="Address"
                        required
                        value={regForm.address}
                        onChange={(e) => setRegForm({...regForm, address: e.target.value})}
                      />
                    </div>
                    <Button type="submit" fullWidth disabled={isLoading} variant="primary" className="mt-4">
                      Get OTP
                    </Button>
                  </>
                ) : (
                  // --- OTP VERIFICATION ---
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Enter the 4-digit code sent to {regForm.phone}</p>
                    <div className="flex justify-center mb-6">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="X X X X"
                        className="w-32 text-center text-2xl tracking-widest py-2 border-b-2 border-primary-600 focus:outline-none bg-transparent"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                    <Button type="submit" fullWidth disabled={isLoading} variant="primary">
                      Verify & Register
                    </Button>
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)}
                      className="mt-4 text-sm text-gray-500 hover:text-gray-800"
                    >
                      Change Details
                    </button>
                  </div>
                )}
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;