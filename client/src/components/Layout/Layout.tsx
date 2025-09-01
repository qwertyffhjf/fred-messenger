import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import MobileMenu from './MobileMenu';

// Hooks
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

// Icons
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Settings as SettingsIcon,
  Person as PersonIcon
} from '../../components/Icons';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const MobileMenuButton = styled.button`
  display: none;
  position: fixed;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  z-index: 1000;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textInverse};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const navigationItems = [
  { path: '/chats', icon: ChatIcon, label: 'chats' },
  { path: '/contacts', icon: PeopleIcon, label: 'contacts' },
  { path: '/calls', icon: PhoneIcon, label: 'calls' },
  { path: '/profile', icon: PersonIcon, label: 'profile' },
  { path: '/settings', icon: SettingsIcon, label: 'settings' },
];

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <LayoutContainer>
      {/* Mobile Menu Button */}
      <MobileMenuButton onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </MobileMenuButton>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />
            <MobileMenu
              isOpen={isMobileMenuOpen}
              onClose={toggleMobileMenu}
              navigationItems={navigationItems}
              currentPath={location.pathname}
              onNavigate={handleNavigation}
              onLogout={handleLogout}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        navigationItems={navigationItems}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <MainContent>
        <Header
          currentPath={location.pathname}
          user={user}
          onToggleSidebar={toggleSidebar}
          onToggleTheme={toggleTheme}
          theme={theme}
        />
        
        <ContentArea>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
