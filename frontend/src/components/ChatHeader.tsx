import { ArrowLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Customer } from '../types';

interface ChatHeaderProps {
  customer: Customer;
  onBack: () => void;
}

const ChatHeader = ({ customer, onBack }: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center space-x-3 z-40 shadow-sm">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        aria-label="Go back"
      >
        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
      </button>
      
      {/* Customer Info */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {customer.profileImage ? (
          <img
            src={customer.profileImage}
            alt={customer.name || 'Customer'}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            {(customer.name || customer.phoneNumber || '?').charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {customer.name || customer.phoneNumber || 'Unknown'}
          </h3>
          <p className="text-sm text-gray-500 truncate">{customer.phoneNumber}</p>
        </div>
      </div>
      
      {/* More Options */}
      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <EllipsisVerticalIcon className="w-6 h-6 text-gray-700" />
      </button>
    </header>
  );
};

export default ChatHeader;
