import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JoinEventPage from './pages/JoinEventPage';
import EventPasswordPage from './pages/EventPasswordPage';
import CreateEventPageNew from './pages/CreateEventPageNew';
import MyPage from './pages/MyPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import AdminDashboard from './pages/AdminDashboard';
import EventMainPage from './pages/EventMainPage';
import InviteCodePage from "./pages/InviteCodePage";


import './styles/globals.css'; 



function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{ backgroundColor: '#FAF9F6' }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/oauth/callback/google" element={<GoogleCallbackPage />} />
            <Route path="/oauth/callback/google/success" element={<GoogleCallbackPage />} />


            <Route path="/event-main" element={<EventMainPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/join-event" element={<JoinEventPage />} />
            <Route path="/event-password" element={<EventPasswordPage />} />
            <Route path="/create-event" element={<CreateEventPageNew/>} />
            <Route path="/invite-code" element={<InviteCodePage />} />


            <Route path="/my-page" element={<MyPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />

            <Route path="/event-enter" element={<EventMainPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
