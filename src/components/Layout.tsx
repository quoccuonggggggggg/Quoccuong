import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ArrowRightLeft, 
  BarChart3, 
  LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Đăng xuất thất bại: ' + error.message);
    } else {
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Tổng quan', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Hàng hóa', path: '/goods', icon: <Package size={20} /> },
    { name: 'Đối tác', path: '/partners', icon: <Users size={20} /> },
    { name: 'Nhập/Xuất', path: '/transactions', icon: <ArrowRightLeft size={20} /> },
    { name: 'Báo cáo', path: '/reports', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Quản Lý Kho</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h2 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.name || 'Quản Lý Kho'}
          </h2>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
