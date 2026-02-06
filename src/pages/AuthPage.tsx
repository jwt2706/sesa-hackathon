import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowLeft } from 'react-icons/fa6';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onBack: () => void;
}

export function AuthPage({ mode, onBack }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLandlord, setIsLandlord] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, name, isLandlord);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-gray-100 transition-colors"
        >
          <FaArrowLeft size={20} />
          Back
        </button>

        <div className="glass-panel rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2 text-center">
            {mode === 'login' ? 'Welcome Back' : 'Join UOttaLive'}
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {mode === 'login' ? 'Login to your account' : 'Create your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isLandlord"
                checked={isLandlord}
                onChange={(e) => setIsLandlord(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-white/20 rounded focus:ring-blue-600"
              />
              <label htmlFor="isLandlord" className="ml-2 text-sm text-gray-300">
                I am a landlord
              </label>
            </div>

            {error && (
              <div className="text-red-200 text-sm bg-red-900/40 p-3 rounded-lg border border-red-500/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 glass-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
