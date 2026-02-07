import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/uOttalive logo.png';
import { FaRightFromBracket } from 'react-icons/fa6';

export default function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="glass-header">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="UOttaLive" className="h-10" />
          <h1 className="text-2xl font-bold text-gray-100 hidden sm:block">UOttaLive</h1>
        </div>

        {profile && (
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 glass-button-secondary"
          >
            <FaRightFromBracket size={18} />
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
