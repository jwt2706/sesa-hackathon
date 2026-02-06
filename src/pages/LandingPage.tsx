interface LandingPageProps {
  onNavigate: (page: 'login' | 'signup') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-blue-900 mb-2">UOttaLive</h1>
          <p className="text-2xl text-blue-700 italic">U-oughta-live here!</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Login
          </button>
          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
