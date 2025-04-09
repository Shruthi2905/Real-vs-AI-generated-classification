import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, X } from 'lucide-react';
import { HomePage } from './components/HomePage';
import { Contact } from './components/Contact';
import { About } from './components/About';
import { ResetPassword } from './components/ResetPassword';
import { createUser, verifyUser, setResetToken } from './lib/db';
import emailjs from '@emailjs/browser';

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

// Initialize EmailJS
emailjs.init({
  publicKey: "--r2g3W0etns04yXb",
  blockHeadless: false, // This is important for development
  limitRate: true
});

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [resetEmail, setResetEmail] = useState(''); // New state for reset email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mousePositions, setMousePositions] = useState<MousePosition[]>([]);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (isVerifying) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePositions(prev => [
          ...prev,
          { x: e.clientX, y: e.clientY, timestamp: Date.now() }
        ].slice(-50));
      };

      window.addEventListener('mousemove', handleMouseMove);

      const interval = setInterval(() => {
        if (mousePositions.length > 20) {
          const isNatural = analyzeMouseMovements(mousePositions);
          if (isNatural) {
            setVerificationProgress(prev => Math.min(prev + 10, 100));
          }
        }
      }, 100);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        clearInterval(interval);
      };
    }
  }, [isVerifying, mousePositions]);

  useEffect(() => {
    if (verificationProgress === 100) {
      completeVerification();
    }
  }, [verificationProgress]);

  const analyzeMouseMovements = (positions: MousePosition[]): boolean => {
    const speeds: number[] = [];
    const directions: number[] = [];

    for (let i = 1; i < positions.length; i++) {
      const dt = positions[i].timestamp - positions[i-1].timestamp;
      const dx = positions[i].x - positions[i-1].x;
      const dy = positions[i].y - positions[i-1].y;
      
      const speed = Math.sqrt(dx*dx + dy*dy) / dt;
      const direction = Math.atan2(dy, dx);
      
      speeds.push(speed);
      directions.push(direction);
    }

    const speedVariation = Math.std(speeds);
    const directionChanges = directions.reduce((changes, dir, i) => {
      if (i === 0) return changes;
      const change = Math.abs(dir - directions[i-1]);
      return changes + (change > 0.1 ? 1 : 0);
    }, 0);

    return speedVariation > 0.1 && directionChanges > 5;
  };

  const completeVerification = async () => {
    setIsVerifying(false);
    
    try {
      if (isLogin) {
        const verifiedUser = await verifyUser(email, password);
        if (verifiedUser) {
          setUser({ email });
        } else {
          setError('Invalid email or password');
        }
      } else {
        const newUser = await createUser(email, password);
        if (newUser) {
          setUser({ email });
        } else {
          setError('Email already exists');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);
    setVerificationProgress(0);
    setMousePositions([]);
  };

  const handleForgotPassword = async () => {
    try {
      setError('');
      
      if (!resetEmail || !resetEmail.trim()) {
        setError('Please enter your email address');
        return;
      }

      // Step 1: Generate a reset token for the user's email
      const token = await setResetToken(resetEmail.trim());
      
      if (!token) {
        setError('Email not found');
        return;
      }

      // Step 2: Create the reset link
      const resetLink = `${window.location.origin}/reset-password?token=${token}`;

      // Step 3: Send the reset email using EmailJS
      const templateParams = {
        to_email: resetEmail.trim(),
        to_name: 'User',
        reset_link: resetLink,
        from_name: 'Truth Behind Pixels',
        subject: 'Password Reset Request',
        message: `Click the following link to reset your password: ${resetLink}`
      };

      console.log('Sending email with params:', templateParams); // Debug log

      const response = await emailjs.send(
        'service_1txcm4m',
        'template_cbh6kkd',
        templateParams
      );

      if (response.status === 200) {
        setResetEmailSent(true);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError('Failed to send reset email. Please try again or contact support.');
    }
  };

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<HomePage userEmail={user.email} />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-violet-950 flex items-center justify-center p-4">
                  <div className="w-full max-w-md">
                    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-violet-500/20">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                          {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-violet-300/60 mt-2">
                          {isLogin ? 'Sign in to continue' : 'Join us today'}
                        </p>
                      </div>

                      {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                            <input
                              type="email"
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-gray-900/50 text-violet-100 placeholder-violet-400/50 border border-violet-500/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent transition-all duration-300"
                            />
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                            <input
                              type="password"
                              placeholder="Password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-gray-900/50 text-violet-100 placeholder-violet-400/50 border border-violet-500/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent transition-all duration-300"
                            />
                          </div>
                        </div>

                        {isVerifying ? (
                          <div className="space-y-4">
                            <div className="text-center text-violet-300">
                              <p>Verifying you're human...</p>
                              <p className="text-sm text-violet-400/60">Move your mouse naturally</p>
                            </div>
                            <div className="h-2 bg-violet-900/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                                style={{ width: `${verificationProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button
                              type="submit"
                              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                              <ArrowRight className="h-5 w-5" />
                            </button>

                            {isLogin && (
                              <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="w-full text-violet-400 hover:text-violet-300 text-sm transition-colors duration-300"
                              >
                                Forgot Password?
                              </button>
                            )}
                          </>
                        )}

                        <div className="text-center mt-6">
                          <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-violet-400 hover:text-violet-300 transition-colors duration-300"
                          >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="mt-8 text-center text-violet-400/60 text-sm">
                      <p>© 2024 AI vs Real. All rights reserved.</p>
                    </div>
                  </div>

                  {showForgotPassword && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                      <div className="bg-gray-800/90 rounded-2xl p-8 max-w-md w-full border border-violet-500/20">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-2xl font-bold text-white">Reset Password</h3>
                          <button
                            onClick={() => {
                              setShowForgotPassword(false);
                              setResetEmailSent(false);
                              setResetEmail(''); // Clear reset email when closing
                            }}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>

                        {resetEmailSent ? (
                          <div className="text-center space-y-4">
                            <div className="text-green-400 bg-green-400/10 p-4 rounded-lg">
                              Password reset instructions have been sent to your email.
                            </div>
                            <p className="text-gray-300">
                              Please check your inbox and follow the instructions to reset your password.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <p className="text-gray-300">
                              Enter your email address and we'll send you instructions to reset your password.
                            </p>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5" />
                              <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full bg-gray-900/50 text-violet-100 placeholder-violet-400/50 border border-violet-500/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent transition-all duration-300"
                              />
                            </div>
                            <button
                              onClick={handleForgotPassword}
                              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Send Reset Instructions
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          </>
        )}
      </Routes>
    </Router>
  );
}

declare global {
  interface Math {
    std(array: number[]): number;
  }
}

Math.std = function(array: number[]): number {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
};

export default App;