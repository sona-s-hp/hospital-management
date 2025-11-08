'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('Logging in...');

    try {
      const response = await fetch('http://localhost:9000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      // if (data.success) {
      //   localStorage.setItem('token', data.token);
      //   localStorage.setItem('user', JSON.stringify(data.user));
      //   setMessage('✅ Login successful! Redirecting...');
  //     if (data.success) {
  // localStorage.setItem('token', data.token);
  // localStorage.setItem('user', JSON.stringify(data.user));

  // // ✅ Save userId directly for easy access later
  // localStorage.setItem('userId', data.user._id);
  // localStorage.setItem('role', data.user.role);

  // setMessage('✅ Login successful! Redirecting...');


  //       if (data.user.role === 'admin') router.push('/admin/dashboard');
  //       else if (data.user.role === 'patient') router.push('/patient/dashboard');
  //       else if (data.user.role === 'doctor') router.push('/doctor/dashboard');
  //       else if (data.user.role === 'lab') router.push('/lab/dashboard');
  //       else if (data.user.role === 'radiology') router.push('/radiology/dashboard');
  //       else if (data.user.role === 'pharmacy') router.push('/pharmacy/dashboard');
  //        else if (data.user.role === 'staff') router.push('/staff/dashboard');
  //       else setError('Unknown user role: ' + data.user.role);
  //     } 
  if (data.success) {
  const userData = {
    _id: data.user._id,
    firstName: data.user.firstName || data.user.name?.split(' ')[0] || 'User',
    lastName: data.user.lastName || data.user.name?.split(' ')[1] || '',
    role: data.user.role,
    email: data.user.email,
  };

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(userData));
  localStorage.setItem('userId', userData._id);
  localStorage.setItem('role', userData.role);

  setMessage('✅ Login successful! Redirecting...');

  if (userData.role === 'admin') router.push('/admin/dashboard');
  else if (userData.role === 'patient') router.push('/patient/dashboard');
  else if (userData.role === 'doctor') router.push('/doctor/dashboard');
  else if (userData.role === 'lab') router.push('/lab/dashboard');
  else if (userData.role === 'radiology') router.push('/radiology/dashboard');
  else if (userData.role === 'pharmacy') router.push('/pharmacy/dashboard');
  else if (userData.role === 'staff') router.push('/staff/dashboard');
  else setError('Unknown user role: ' + userData.role);
}else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('⚠️ Login failed. Check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center animate-fadeIn"
      style={{ backgroundImage: "url('/images/log1.jpg')" }}
    >
      <div
        className="max-w-md w-full p-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/30 animate-slideUp"
        style={{ backgroundImage: "url('/images/log2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6 animate-bounce">
          Sign in to your account
        </h2>
        <p className="text-center text-sm text-gray-700 mb-6">
          Or{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            register as a new patient
          </Link>
        </p>

        <form className="space-y-4" onSubmit={handleLogin}>
          {(error || message) && (
            <div
              className={`px-4 py-3 rounded-lg ${
                error
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : 'bg-green-50 border border-green-200 text-green-600'
              }`}
            >
              {error || message}
            </div>
          )}

          <input
  type="text"
  name="email"
  value={formData.email}
  onChange={handleInputChange}
  placeholder="Email or Username (for patients)"
  required
  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70"
  disabled={loading}
/>


          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Tailwind Animations */}
      <style jsx>{`
        @keyframes slideUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
