import { User, LogOut, Star } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  userEmail: string | null;
}

export function Navbar({ userEmail }: NavbarProps) {
  const location = useLocation();
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-[#1a1f3d] border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-2">
              <Star className="h-6 w-6 text-[#c4b5fd] transform rotate-45" />
              <span className="text-2xl font-bold text-[#c4b5fd]">
                Truth-Behind-Pixels
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${
                    location.pathname === '/'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`${
                    location.pathname === '/about'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className={`${
                    location.pathname === '/contact'
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-300" />
              <span className="text-gray-300 text-sm">{userEmail}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}