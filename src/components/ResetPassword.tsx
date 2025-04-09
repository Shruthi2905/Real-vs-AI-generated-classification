import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyResetToken, resetPassword } from '../lib/db';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link');
        return;
      }

      const email = await verifyResetToken(token);
      if (!email) {
        setError('This reset link has expired or is invalid');
      } else {
        setIsValidToken(true);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    try {
      const success = await resetPassword(token, newPassword);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (error && !isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-violet-500/20 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="text-red-400 w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-4">Invalid Reset Link</h1>
          <p className="text-gray-300 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-violet-500/20 max-w-md w-full">
        {success ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h2>
            <p className="text-gray-300 mb-4">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white text-center mb-6">Reset Your Password</h1>
            
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-gray-900/50 text-violet-100 placeholder-violet-400/50 border border-violet-500/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-900/50 text-violet-100 placeholder-violet-400/50 border border-violet-500/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}