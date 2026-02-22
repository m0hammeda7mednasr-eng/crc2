import { Link, useLocation } from 'react-router-dom';
import { ChatBubbleLeftIcon, ShoppingBagIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as ChatSolidIcon, ShoppingBagIcon as ShoppingSolidIcon, Cog6ToothIcon as CogSolidIcon } from '@heroicons/react/24/solid';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/chat', label: 'Chats', icon: ChatBubbleLeftIcon, activeIcon: ChatSolidIcon },
    { path: '/orders', label: 'Orders', icon: ShoppingBagIcon, activeIcon: ShoppingSolidIcon },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon, activeIcon: CogSolidIcon },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
