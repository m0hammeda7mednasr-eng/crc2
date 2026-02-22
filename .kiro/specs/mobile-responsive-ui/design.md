# Mobile Responsive UI - Design Document

## 📐 Architecture Overview

### Component Structure:
```
App
├── Layout (Responsive)
│   ├── Header (Desktop/Tablet)
│   ├── Sidebar (Desktop/Tablet)
│   └── BottomNav (Mobile)
├── Chat Page
│   ├── ChatList (Mobile: Full Screen)
│   │   ├── SearchBar
│   │   ├── CustomerItem[]
│   │   └── AddButton
│   └── ChatView (Mobile: Full Screen with Back)
│       ├── ChatHeader (with Back Button)
│       ├── MessageList
│       └── MessageInput
├── Orders Page
└── Settings Page
```

---

## 🎨 UI Components Design

### 1. BottomNav Component (Mobile Only)
**Purpose:** Navigation bar في أسفل الشاشة للموبايل

**Props:**
```typescript
interface BottomNavProps {
  currentPath: string;
}
```

**Design:**
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
  <div className="flex justify-around items-center h-16">
    <NavItem icon="chat" label="Chats" path="/chat" active={...} />
    <NavItem icon="orders" label="Orders" path="/orders" active={...} />
    <NavItem icon="settings" label="Settings" path="/settings" active={...} />
  </div>
</nav>
```

**States:**
- Active: primary color + bold
- Inactive: gray color
- Badge: red dot for unread

---

### 2. ChatHeader Component (Mobile)
**Purpose:** Header في أعلى الشات مع زر رجوع

**Props:**
```typescript
interface ChatHeaderProps {
  customer: Customer;
  onBack: () => void;
}
```

**Design:**
```tsx
<header className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center space-x-3 z-40">
  {/* Back Button */}
  <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
    <ArrowLeftIcon className="w-6 h-6" />
  </button>
  
  {/* Customer Info */}
  <div className="flex items-center space-x-3 flex-1">
    <Avatar src={customer.profileImage} name={customer.name} />
    <div>
      <h3 className="font-semibold">{customer.name}</h3>
      <p className="text-sm text-gray-500">{customer.phoneNumber}</p>
    </div>
  </div>
  
  {/* Actions */}
  <button className="p-2">
    <MoreIcon />
  </button>
</header>
```

---

### 3. Responsive Chat Layout

#### Mobile (< 768px):
```tsx
{/* Show EITHER list OR chat, not both */}
{!selectedCustomer ? (
  <ChatList onSelectCustomer={handleSelect} />
) : (
  <ChatView customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
)}
```

#### Tablet/Desktop (>= 768px):
```tsx
{/* Show both side by side */}
<div className="flex h-full">
  <ChatList className="w-1/3" onSelectCustomer={handleSelect} />
  <ChatView customer={selectedCustomer} className="flex-1" />
</div>
```

---

## 📱 Responsive Breakpoints

### Tailwind Classes:
```css
/* Mobile First */
.container {
  /* Mobile: Full width */
  width: 100%;
  
  /* Tablet: 768px+ */
  @media (min-width: 768px) {
    max-width: 768px;
  }
  
  /* Desktop: 1024px+ */
  @media (min-width: 1024px) {
    max-width: 1280px;
  }
}
```

### Component Visibility:
```tsx
{/* Desktop Sidebar */}
<Sidebar className="hidden md:block" />

{/* Mobile Bottom Nav */}
<BottomNav className="md:hidden" />

{/* Mobile Back Button */}
<BackButton className="md:hidden" />
```

---

## 🔄 State Management

### Chat State:
```typescript
interface ChatState {
  // Mobile: null when showing list, Customer when showing chat
  selectedCustomer: Customer | null;
  
  // All customers
  customers: Customer[];
  
  // Messages for selected customer
  messages: Message[];
  
  // Mobile view state
  isMobileView: boolean; // window.innerWidth < 768
}
```

### Navigation State:
```typescript
interface NavState {
  currentPath: string; // '/chat', '/orders', '/settings'
  previousPath: string; // for back navigation
}
```

---

## 🎯 User Interactions

### 1. Opening Chat (Mobile):
```typescript
const handleCustomerSelect = (customer: Customer) => {
  setSelectedCustomer(customer);
  // On mobile, this hides the list and shows the chat
  // On desktop, this just updates the right panel
};
```

### 2. Going Back (Mobile):
```typescript
const handleBack = () => {
  setSelectedCustomer(null);
  // This shows the list again on mobile
};
```

### 3. Browser Back Button:
```typescript
useEffect(() => {
  const handlePopState = () => {
    if (selectedCustomer && isMobileView) {
      setSelectedCustomer(null);
    }
  };
  
  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, [selectedCustomer, isMobileView]);
```

---

## 📸 Media Upload (Mobile)

### File Input Enhancement:
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*"
  capture="environment" // Opens camera on mobile
  onChange={handleImageSelect}
  className="hidden"
/>

<button onClick={() => fileInputRef.current?.click()}>
  <CameraIcon />
</button>
```

### Image Preview (Mobile Optimized):
```tsx
{imagePreview && (
  <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
    <div className="relative max-w-full max-h-full">
      <img src={imagePreview} className="max-w-full max-h-[80vh] object-contain" />
      <button onClick={handleRemove} className="absolute top-2 right-2">
        <XIcon />
      </button>
    </div>
  </div>
)}
```

---

## 🎨 Styling Guidelines

### Touch Targets:
```css
/* Minimum 44px for touch */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}
```

### Typography:
```css
/* Mobile: Larger text */
.mobile-text {
  font-size: 16px; /* Minimum for readability */
  line-height: 1.5;
}

/* Desktop: Normal text */
.desktop-text {
  font-size: 14px;
  line-height: 1.4;
}
```

### Spacing:
```css
/* Mobile: More spacing */
.mobile-spacing {
  padding: 16px;
  gap: 16px;
}

/* Desktop: Compact */
.desktop-spacing {
  padding: 12px;
  gap: 12px;
}
```

---

## 🔧 Technical Implementation

### 1. Responsive Hook:
```typescript
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};
```

### 2. Scroll Lock (Mobile):
```typescript
// Prevent body scroll when chat is open
useEffect(() => {
  if (selectedCustomer && isMobile) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
  
  return () => {
    document.body.style.overflow = 'auto';
  };
}, [selectedCustomer, isMobile]);
```

### 3. Virtual Keyboard Handling:
```typescript
// Adjust layout when keyboard opens
useEffect(() => {
  const handleResize = () => {
    // Detect keyboard open (viewport height change)
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## 🎭 Animations

### Page Transitions (Mobile):
```css
/* Slide in from right */
.chat-enter {
  transform: translateX(100%);
}

.chat-enter-active {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

/* Slide out to right */
.chat-exit {
  transform: translateX(0);
}

.chat-exit-active {
  transform: translateX(100%);
  transition: transform 300ms ease-in;
}
```

### Bottom Nav Animations:
```css
.bottom-nav-item {
  transition: all 200ms ease;
}

.bottom-nav-item.active {
  transform: scale(1.1);
  color: var(--primary-color);
}
```

---

## 📊 Performance Optimizations

### 1. Lazy Loading:
```typescript
// Load images only when visible
<img 
  src={imageUrl} 
  loading="lazy"
  decoding="async"
/>
```

### 2. Virtual Scrolling:
```typescript
// For long message lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
>
  {MessageRow}
</FixedSizeList>
```

### 3. Image Optimization:
```typescript
// Compress images before upload
const compressImage = async (file: File): Promise<File> => {
  // Use canvas to resize/compress
  // Target: max 1200px width, 80% quality
};
```

---

## 🧪 Testing Strategy

### Responsive Testing:
```typescript
describe('Mobile Responsive', () => {
  it('shows bottom nav on mobile', () => {
    // Set viewport to mobile
    cy.viewport(375, 667);
    cy.get('[data-testid="bottom-nav"]').should('be.visible');
  });
  
  it('shows sidebar on desktop', () => {
    // Set viewport to desktop
    cy.viewport(1280, 720);
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="bottom-nav"]').should('not.exist');
  });
  
  it('navigates back on mobile', () => {
    cy.viewport(375, 667);
    cy.get('[data-testid="customer-item"]').first().click();
    cy.get('[data-testid="back-button"]').should('be.visible');
    cy.get('[data-testid="back-button"]').click();
    cy.get('[data-testid="chat-list"]').should('be.visible');
  });
});
```

---

## 🎯 Accessibility

### Touch Targets:
- Minimum 44x44px
- Adequate spacing (8px minimum)

### Focus States:
```css
.button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Screen Reader:
```tsx
<button aria-label="Go back to chat list">
  <ArrowLeftIcon />
</button>
```

---

## 📝 Implementation Checklist

### Phase 1: Core Mobile UI
- [ ] Create BottomNav component
- [ ] Create ChatHeader with back button
- [ ] Implement responsive layout switching
- [ ] Add mobile-specific styles

### Phase 2: Navigation
- [ ] Implement mobile navigation logic
- [ ] Add browser back button support
- [ ] Handle route changes

### Phase 3: Media Upload
- [ ] Enhance file input for mobile
- [ ] Add camera capture support
- [ ] Implement image preview
- [ ] Add image compression

### Phase 4: Polish
- [ ] Add animations
- [ ] Optimize performance
- [ ] Test on real devices
- [ ] Fix any issues

---

## 🚀 Deployment Considerations

### Mobile Testing:
- Test on real devices (iOS, Android)
- Test different screen sizes
- Test different browsers (Safari, Chrome)
- Test touch interactions

### Performance:
- Lighthouse score > 90
- First Contentful Paint < 2s
- Time to Interactive < 3s

---

**Status:** 📋 Ready for Implementation
