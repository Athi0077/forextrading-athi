import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  Menu,
  X,
  CreditCard,
  Shield,
  LifeBuoy,
  MessageSquare,
  Cpu
} from 'lucide-react';

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: Activity },
    { name: 'Support', path: '/admin/support', icon: LifeBuoy },
    { name: 'Announcements', path: '/admin/announcements', icon: MessageSquare },
    { name: 'AI Config', path: '/admin/ai', icon: Cpu },
    { name: 'Security Logs', path: '/admin/logs', icon: Shield },
  ];

  const renderNavLinks = (items) => (
    <nav className="space-y-1">
      {items.map((item) => {
        // Handle precise active matching for Dashboard vs other sub-routes
        const isActive = item.path === '/admin' 
          ? location.pathname === '/admin' 
          : location.pathname.startsWith(item.path);
          
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center px-4 py-3 mb-1 rounded-xl text-sm font-medium transition-all duration-300 group ${
              isActive 
                ? 'bg-red-500/10 text-red-500 shadow-[inset_0_0_12px_#ef4444] shadow-red-500/10' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-red-500' : 'text-zinc-500 group-hover:text-white'}`} aria-hidden="true" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#09090b] text-zinc-300">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#121214] border-r border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-20 px-6 bg-transparent">
          <Link to="/admin" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-red-500/10 transition-all">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              ADMIN<span className="text-red-500">PANEL</span>
            </span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-zinc-400 hover:text-white p-2">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 space-y-8">
          <div>
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-4">Management</div>
            {renderNavLinks(navItems)}
          </div>
        </div>

        {currentUser && (
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center p-2 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer justify-between">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(currentUser.name || currentUser.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 hidden lg:block">
                  <p className="text-sm font-medium text-white truncate">{currentUser.name || currentUser.email.split('@')[0]}</p>
                  <p className="text-xs text-red-400 font-semibold truncate">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b] relative z-0">
        <header className="h-16 flex-shrink-0 bg-[#121214]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-10 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-tight">ADMIN<span className="text-red-500">PANEL</span></span>
          </div>
          <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
