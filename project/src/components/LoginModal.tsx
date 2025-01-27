import { useState } from 'react';
import { Mail, Lock, ArrowRight, Chrome } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Please add your Firebase configuration.');
      return;
    }
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth!, email, password);
      } else {
        await createUserWithEmailAndPassword(auth!, email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleGoogleAuth = async () => {
    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Please add your Firebase configuration.');
      return;
    }

    try {
      await signInWithPopup(auth!, googleProvider);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-pink/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-pink-light">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-pink-light/60 hover:text-pink-light"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-light h-5 w-5" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy/50 text-pink-light placeholder-pink-light/50 border border-pink/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-pink/40 focus:border-transparent transition-all duration-300"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-light h-5 w-5" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy/50 text-pink-light placeholder-pink-light/50 border border-pink/30 rounded-lg py-3 px-12 focus:outline-none focus:ring-2 focus:ring-pink/40 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-pink hover:bg-pink-dark text-navy-dark font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-pink/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-pink-light">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full bg-navy/50 text-pink-light border border-pink/30 rounded-lg py-3 px-6 flex items-center justify-center space-x-2 hover:bg-navy-dark/50 transition-all duration-300"
            >
              <Chrome className="h-5 w-5 text-pink-light" />
              <span>Continue with Google</span>
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-pink-light hover:text-pink transition-colors duration-300"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}