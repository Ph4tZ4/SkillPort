import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Footer from './components/Footer';
import PageSkeleton from './components/PageSkeleton';
import { useAuthStore } from './store/authStore';

const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/RegisterScreen'));
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'));
const PortfolioEditorScreen = lazy(() => import('./screens/PortfolioEditorScreen'));
const PortfolioViewScreen = lazy(() => import('./screens/PortfolioViewScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const JobBoardScreen = lazy(() => import('./screens/JobBoardScreen'));
const MatchScreen = lazy(() => import('./screens/MatchScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

const App: React.FC = () => {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    // Set dark mode as default
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, [loadUser]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/portfolio/new" element={<PortfolioEditorScreen />} />
            <Route path="/portfolio/edit/:id" element={<PortfolioEditorScreen />} />
            <Route path="/portfolio/:id" element={<PortfolioViewScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/jobs" element={<JobBoardScreen />} />
            <Route path="/matches" element={<MatchScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default App;
