# 🎨 Frontend Updates - TODO

## ✅ Backend Complete:
- Database schema updated
- Customer service: unread count, delete, mark as read
- Message service: status updates
- API endpoints ready

## 📝 Frontend Updates Needed:

### 1. Update Types (frontend/src/types/index.ts)
```typescript
export interface Customer {
  id: string;
  phoneNumber: string;
  name?: string;
  profileImage?: string;  // NEW
  unreadCount: number;    // NEW
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: {
    messages: number;
    orders: number;
  };
}

export interface Message {
  id: string;
  content: string;
  type: string;
  direction: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';  // NEW
  imageUrl?: string;
  voiceUrl?: string;
  duration?: number;
  customerId: string;
  createdAt: string;
  customer?: Customer;
}
```

### 2. Update Chat.tsx - Customers List

#### Add Unread Badge:
```tsx
{customers.map((customer) => (
  <div
    key={customer.id}
    onClick={() => handleCustomerSelect(customer)}
    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
      selectedCustomer?.id === customer.id 
        ? 'bg-primary-50 border-l-4 border-l-primary-600' 
        : customer.unreadCount > 0 
        ? 'bg-blue-50'  // Highlight unread
        : ''
    }`}
  >
    <div className="flex items-center space-x-3">
      {/* Profile Image or Avatar */}
      <div className="relative">
        {customer.profileImage ? (
          <img 
            src={customer.profileImage} 
            alt={customer.name || 'Customer'} 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {((customer.name || customer.phoneNumber || '?').charAt(0).toUpperCase())}
          </div>
        )}
        
        {/* Unread Badge */}
        {customer.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {customer.unreadCount > 9 ? '9+' : customer.unreadCount}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${customer.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
          {customer.name || customer.phoneNumber || 'Unknown'}
        </p>
        <p className="text-sm text-gray-500 truncate">{customer.phoneNumber || 'No phone'}</p>
      </div>
      
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteCustomer(customer.id);
        }}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete chat"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
))}
```

#### Add Delete Handler:
```typescript
const handleDeleteCustomer = async (customerId: string) => {
  if (!confirm('Are you sure you want to delete this chat? This will delete all messages and cannot be undone.')) {
    return;
  }

  try {
    await api.delete(`/api/customers/${customerId}`);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
      setMessages([]);
    }
  } catch (error) {
    console.error('Failed to delete customer:', error);
    alert('Failed to delete chat');
  }
};
```

#### Add Mark as Read Handler:
```typescript
const handleCustomerSelect = async (customer: Customer) => {
  setSelectedCustomer(customer);
  fetchMessages(customer.id);
  
  // Mark as read
  if (customer.unreadCount > 0) {
    try {
      await api.post(`/api/customers/${customer.id}/read`);
      setCustomers(prev => 
        prev.map(c => 
          c.id === customer.id 
            ? { ...c, unreadCount: 0 } 
            : c
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }
};
```

### 3. Update Chat.tsx - Message Status Indicators

```tsx
{/* Message Status Indicators */}
{message.direction === 'outgoing' && (
  <div className="flex items-center space-x-1 mt-1">
    {message.status === 'sending' && (
      <div className="text-gray-400 text-xs">⏰ Sending...</div>
    )}
    {message.status === 'sent' && (
      <div className="text-gray-400 text-xs">✓</div>
    )}
    {message.status === 'delivered' && (
      <div className="text-gray-400 text-xs">✓✓</div>
    )}
    {message.status === 'read' && (
      <div className="text-blue-500 text-xs">✓✓</div>
    )}
    {message.status === 'failed' && (
      <div className="text-red-500 text-xs">❌ Failed</div>
    )}
  </div>
)}
```

### 4. Update Socket Listeners

```typescript
// Listen for customer updates
socketService.on('customer:updated', (data: { customer: Customer }) => {
  setCustomers(prev => 
    prev.map(c => 
      c.id === data.customer.id 
        ? { ...c, ...data.customer } 
        : c
    )
  );
});

// Listen for customer deletion
socketService.on('customer:deleted', (data: { customerId: string }) => {
  setCustomers(prev => prev.filter(c => c.id !== data.customerId));
  if (selectedCustomer?.id === data.customerId) {
    setSelectedCustomer(null);
    setMessages([]);
  }
});

// Listen for message status updates
socketService.on('message:status', (data: { messageId: string; status: string }) => {
  setMessages(prev => 
    prev.map(m => 
      m.id === data.messageId 
        ? { ...m, status: data.status } 
        : m
    )
  );
});
```

---

## 🎯 Priority Order:

1. **High Priority:**
   - Update types
   - Add unread badge
   - Add delete button
   - Mark as read on select

2. **Medium Priority:**
   - Message status indicators
   - Socket listeners for real-time updates

3. **Nice to Have:**
   - Profile images
   - Animations

---

**Status:** 📋 Ready for Implementation
