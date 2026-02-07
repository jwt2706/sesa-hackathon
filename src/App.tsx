import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { LandlordDashboard } from './pages/LandlordDashboard';

type Page = 'landing' | 'login' | 'signup' | 'dashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel rounded-2xl px-10 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return profile.is_landlord ? <LandlordDashboard /> : <StudentDashboard />;
  }

  if (currentPage === 'landing') {
    return <LandingPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'login' || currentPage === 'signup') {
    return (
      <AuthPage
        mode={currentPage}
        onBack={() => setCurrentPage('landing')}
      />
    );
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Header />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
