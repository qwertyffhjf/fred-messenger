import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ChatList from './pages/Chats/ChatList';
import ChatRoom from './pages/Chats/ChatRoom';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Contacts from './pages/Contacts/Contacts';
import Calls from './pages/Calls/Calls';

// Hooks
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Styles
import { GlobalStyles } from './styles/GlobalStyles';
import { lightTheme, darkTheme } from './styles/themes';

// Initialize i18n
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { i18n } = useTranslation();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Check authentication status on app start
    checkAuth();
    
    // Set language from localStorage or browser
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [checkAuth, i18n]);

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={currentTheme}>
        <GlobalStyles />
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
              />
              <Route 
                path="/register" 
                element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} 
              />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />} 
              >
                <Route index element={<Navigate to="/chats" replace />} />
                <Route path="chats" element={<ChatList />} />
                <Route path="chat/:chatId" element={<ChatRoom />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="calls" element={<Calls />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: currentTheme.colors.background,
                  color: currentTheme.colors.text,
                  border: `1px solid ${currentTheme.colors.border}`,
                },
              }}
            />
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
