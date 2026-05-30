import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import PortfolioEditorScreen from './screens/PortfolioEditorScreen';
import PortfolioViewScreen from './screens/PortfolioViewScreen';
import SearchScreen from './screens/SearchScreen';
import JobBoardScreen from './screens/JobBoardScreen';
import MatchScreen from './screens/MatchScreen';
import ProfileScreen from './screens/ProfileScreen';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />
      <main className="flex-1">
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
      </main>
      <Footer />
    </div>
  );
};

export default App;
