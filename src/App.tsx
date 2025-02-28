
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from './components/AuthContext';
import { Providers } from './providers';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Experiences from './pages/Experiences';
import ExperienceDetail from './pages/ExperienceDetail';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Host from './pages/Host';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Providers>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/host" element={<Host />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </Providers>
  );
}

export default App;
