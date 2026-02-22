# Mobile Responsive UI - Implementation Tasks

## 📋 Task List

### Phase 1: Core Components

- [x] 1. Create BottomNav Component
  - [x] 1.1 Create `frontend/src/components/BottomNav.tsx`
  - [x] 1.2 Add navigation items (Chat, Orders, Settings)
  - [x] 1.3 Add active state styling
  - [x] 1.4 Add icons (using Heroicons)
  - [x] 1.5 Make it fixed at bottom
  - [x] 1.6 Hide on desktop (md:hidden)

- [x] 2. Create ChatHeader Component
  - [x] 2.1 Create `frontend/src/components/ChatHeader.tsx`
  - [x] 2.2 Add back button
  - [x] 2.3 Add customer info (avatar, name, phone)
  - [x] 2.4 Add more options button
  - [x] 2.5 Make it sticky at top
  - [x] 2.6 Show only on mobile when chat is open

- [x] 3. Create useIsMobile Hook
  - [x] 3.1 Create `frontend/src/hooks/useIsMobile.ts`
  - [x] 3.2 Detect screen size (< 768px)
  - [x] 3.3 Handle window resize
  - [x] 3.4 Return boolean

### Phase 2: Responsive Layout

- [x] 4. Update Chat.tsx for Mobile
  - [x] 4.1 Import useIsMobile hook
  - [x] 4.2 Add conditional rendering (list OR chat on mobile)
  - [x] 4.3 Keep side-by-side on desktop
  - [x] 4.4 Add ChatHeader when chat is open on mobile
  - [x] 4.5 Handle back button click
  - [x] 4.6 Update CSS classes for responsive

- [x] 5. Update Layout Component
  - [x] 5.1 Hide Sidebar on mobile
  - [x] 5.2 Show BottomNav on mobile
  - [x] 5.3 Adjust padding for bottom nav
  - [x] 5.4 Update responsive breakpoints

### Phase 3: Navigation Logic

- [ ] 6. Implement Mobile Navigation
  - [ ] 6.1 Add state for selected customer
  - [ ] 6.2 Handle customer select (show chat on mobile)
  - [ ] 6.3 Handle back button (show list on mobile)
  - [ ] 6.4 Update URL when navigating
  - [ ] 6.5 Handle browser back button

- [ ] 7. Add Route Management
  - [ ] 7.1 Update routes for mobile navigation
  - [ ] 7.2 Add history.push for navigation
  - [ ] 7.3 Handle popstate event
  - [ ] 7.4 Preserve scroll position

### Phase 4: Media Upload Enhancement

- [ ] 8. Enhance Image Upload for Mobile
  - [x] 8.1 Add `capture="environment"` to file input
  - [ ] 8.2 Update file input styling for mobile
  - [ ] 8.3 Make upload button larger on mobile
  - [ ] 8.4 Add haptic feedback (if supported)

- [ ] 9. Improve Image Preview
  - [ ] 9.1 Make preview full screen on mobile
  - [ ] 9.2 Add pinch to zoom (optional)
  - [ ] 9.3 Add swipe to dismiss (optional)
  - [ ] 9.4 Optimize preview size

### Phase 5: Styling & Polish

- [ ] 10. Mobile-Specific Styles
  - [ ] 10.1 Increase touch target sizes (min 44px)
  - [ ] 10.2 Adjust font sizes for mobile
  - [ ] 10.3 Increase spacing on mobile
  - [ ] 10.4 Update colors for better contrast

- [ ] 11. Add Animations
  - [ ] 11.1 Add slide transition for chat view
  - [ ] 11.2 Add fade transition for bottom nav
  - [ ] 11.3 Add scale animation for active nav item
  - [ ] 11.4 Add smooth scroll

- [ ] 12. Handle Virtual Keyboard
  - [ ] 12.1 Adjust layout when keyboard opens
  - [ ] 12.2 Scroll to input when focused
  - [ ] 12.3 Prevent body scroll
  - [ ] 12.4 Fix viewport height

### Phase 6: Testing & Optimization

- [ ] 13. Responsive Testing
  - [ ] 13.1 Test on mobile (< 768px)
  - [ ] 13.2 Test on tablet (768px - 1024px)
  - [ ] 13.3 Test on desktop (> 1024px)
  - [ ] 13.4 Test orientation changes

- [ ] 14. Performance Optimization
  - [ ] 14.1 Add lazy loading for images
  - [ ] 14.2 Optimize bundle size
  - [ ] 14.3 Add image compression
  - [ ] 14.4 Test on slow 3G

- [ ] 15. Cross-Browser Testing
  - [ ] 15.1 Test on Chrome (Android)
  - [ ] 15.2 Test on Safari (iOS)
  - [ ] 15.3 Test on Firefox
  - [ ] 15.4 Fix any browser-specific issues

### Phase 7: Deployment

- [ ] 16. Final Testing
  - [ ] 16.1 Test on real devices
  - [ ] 16.2 Test all user flows
  - [ ] 16.3 Fix any bugs
  - [ ] 16.4 Get user feedback

- [ ] 17. Deploy to Production
  - [ ] 17.1 Commit all changes
  - [ ] 17.2 Push to GitHub
  - [ ] 17.3 Deploy to Vercel
  - [ ] 17.4 Test production build

---

## 📝 Task Details

### Task 1: Create BottomNav Component

**File:** `frontend/src/components/BottomNav.tsx`

**Code:**
```typescript
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
```

---

### Task 2: Create ChatHeader Component

**File:** `frontend/src/components/ChatHeader.tsx`

**Code:**
```typescript
import { ArrowLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Customer } from '../types';

interface ChatHeaderProps {
  customer: Customer;
  onBack: () => void;
}

const ChatHeader = ({ customer, onBack }: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center space-x-3 z-40 md:hidden">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
```

---

### Task 3: Create useIsMobile Hook

**File:** `frontend/src/hooks/useIsMobile.ts`

**Code:**
```typescript
import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint: number = 768): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    
    // Call once to set initial value
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;
```

---

### Task 4: Update Chat.tsx for Mobile

**Changes needed:**
1. Import useIsMobile and ChatHeader
2. Add conditional rendering for mobile
3. Handle back button
4. Update layout classes

**Key code snippets:**
```typescript
const isMobile = useIsMobile();

// Mobile: Show list OR chat
// Desktop: Show both
{isMobile ? (
  !selectedCustomer ? (
    <ChatList />
  ) : (
    <>
      <ChatHeader customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
      <ChatView />
    </>
  )
) : (
  <div className="flex">
    <ChatList />
    <ChatView />
  </div>
)}
```

---

## ✅ Success Criteria

Each task is complete when:
1. Code is written and tested
2. Works on mobile, tablet, and desktop
3. No console errors
4. Passes visual inspection
5. User can navigate smoothly

---

## 🎯 Priority

**High Priority (Phase 1-3):**
- Bottom navigation
- Chat header with back button
- Responsive layout
- Mobile navigation logic

**Medium Priority (Phase 4-5):**
- Media upload enhancement
- Styling and animations

**Low Priority (Phase 6-7):**
- Performance optimization
- Cross-browser testing

---

**Status:** 📋 Ready to Start Implementation
