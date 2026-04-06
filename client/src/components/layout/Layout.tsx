import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { 
  BarChart2, 
  Bell, 
  ShieldAlert, 
  FileText, 
  Activity, 
  Settings, 
  Sun, 
  Moon,
  ChevronRight
} from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, lastUpdated } = useData();

  const navItems = [
    { name: 'Overview', path: '/', icon: <Activity size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell size={20} /> },
    { name: 'Security', path: '/security', icon: <ShieldAlert size={20} /> },
    { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"><Activity size={24} /></div>
          <div>
             <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', fontWeight: 600 }}>F.A.S.T.</h2>
             <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: '-2px' }}>Fuel Anomaly & Security</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <NavLink to="/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Tracker</span>
            <ChevronRight size={16} className="chevron" />
            <span className="current">Live View</span>
          </div>
          
          <div className="topbar-actions">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot"></span>
              {isConnected && lastUpdated 
                ? `Sync: ${lastUpdated.toLocaleTimeString()}` 
                : 'Connecting...'}
            </div>
            
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <div className="user-avatar">
              <span className="initial">AD</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
