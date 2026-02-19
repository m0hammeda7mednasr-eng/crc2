import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Chat from '../Chat';
import * as api from '../../services/api';
import * as socketService from '../../services/socket';

// Mock the API and socket service
vi.mock('../../services/api');
vi.mock('../../services/socket', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}));

describe('Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders customer list and chat area', async () => {
    // Mock API response
    vi.spyOn(api.default, 'get').mockResolvedValue({
      data: {
        customers: [
          {
            id: '1',
            phoneNumber: '+201234567890',
            name: 'Test Customer',
            userId: 'user1',
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    // Check if "Customers" heading is rendered
    await waitFor(() => {
      expect(screen.getByText('Customers')).toBeDefined();
    });

    // Check if customer is rendered
    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeDefined();
    });
  });

  it('displays placeholder when no customer is selected', () => {
    vi.spyOn(api.default, 'get').mockResolvedValue({
      data: { customers: [] },
    });

    render(
      <BrowserRouter>
        <Chat />
      </BrowserRouter>
    );

    expect(screen.getByText('Select a customer to start chatting')).toBeDefined();
  });
});
