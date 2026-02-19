# Design Document: Admin Dashboard System

## Overview

The Admin Dashboard System extends the existing WhatsApp-Shopify CRM platform with comprehensive administrative capabilities. The system introduces role-based access control (RBAC), subscription management, multi-platform social media integration, usage tracking, and advanced analytics. The architecture follows the existing Express.js + React + Prisma stack, adding new models, services, and UI components while maintaining backward compatibility with the current system.

The design emphasizes security through JWT-based authentication with role claims, encrypted credential storage, and audit logging. Real-time updates leverage the existing Socket.io infrastructure. The subscription system enforces usage limits through middleware, while the multi-platform integration uses a plugin architecture for extensibility.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Admin Dashboard UI  │  User Management  │  Analytics       │
│  Subscription UI     │  Platform Config  │  Audit Logs      │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTPS + WebSocket
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Auth Middleware (RBAC)  │  Admin Controllers               │
│  Usage Enforcement       │  Subscription Service            │
│  Platform Adapters       │  Analytics Service               │
└─────────────────────────────────────────────────────────────┘
                            │
                    Prisma ORM
                            │
┌─────────────────────────────────────────────────────────────┐
│              Database (SQLite/PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│  Users (extended)        │  Subscriptions                   │
│  PlatformCredentials     │  UsageMetrics                    │
│  AuditLogs              │  Payments                         │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              External Services                               │
├─────────────────────────────────────────────────────────────┤
│  WhatsApp API  │  Instagram API  │  Facebook API            │
│  TikTok API    │  LinkedIn API   │  YouTube API             │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Login → JWT Generation (with role claim) → Token Storage
                                                      ↓
Admin Request → Auth Middleware → Role Check → Controller
                                      ↓
                                  403 if not admin
```

### Multi-Platform Message Flow

```
External Platform → Webhook → Platform Adapter → Message Router
                                                       ↓
                                            Unified Inbox Storage
                                                       ↓
                                            WebSocket Broadcast
                                                       ↓
                                            User's Frontend
```

## Components and Interfaces

### Backend Components

#### 1. Authentication and Authorization

**AdminAuthMiddleware**
```typescript
interface AdminAuthMiddleware {
  verifyAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void>
  verifyToken(token: string): Promise<JWTPayload>
  checkRole