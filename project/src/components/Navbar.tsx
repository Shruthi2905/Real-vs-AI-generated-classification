import { Home, Info, LogIn, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Link } from './Link';
import { LoginModal } from './LoginModal';
import { Logo } from './Logo';

export function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <nav className="bg-navy-dark/80 backdrop-blur-sm border-b border-pink/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex space-x-8">
              <Link href="#" icon={<Home size={18} />}>Home</Link>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-pink-light hover:text-pink transition-colors flex items-center gap-2 px-3 py-2"
              >
                <LogIn size={18} />
                Login
              </button>
              <Link href="#" icon={<Info size={18} />}>About</Link>
              <Link href="#" icon={<MessageSquare size={18} />}>Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}