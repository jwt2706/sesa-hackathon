interface LandingPageProps {
  onNavigate: (page: 'login' | 'signup') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-gray-100 mb-2">UOttaLive</h1>
          <p className="text-2xl text-gray-400 italic">U-oughta-live here!</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3 glass-button"
          >
            Login
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3 glass-button-secondary"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
