import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Nalco from './Nalco';
import api from '../../../utils/api';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div data-testid="chart-mock">
      <div data-testid="chart-data">{JSON.stringify(data)}</div>
      <div data-testid="chart-options">{JSON.stringify(options)}</div>
    </div>
  )
}));

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

// Mock the API
jest.mock('../../../utils/api');
const mockedApi = api;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Nalco Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
  });

  test('renders NALCO price card', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        nalcoPrice: 50000 // Price in paisa, will be displayed as ₹50/Kg
      }
    });

    render(<Nalco />);

    await waitFor(() => {
      expect(screen.getByText(/Today's Nalco Price/)).toBeInTheDocument();
      expect(screen.getByText(/₹50 \/ Kg/)).toBeInTheDocument();
    });
  });

  test('shows click hint text', () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { nalcoPrice: 50000 }
    });

    render(<Nalco />);

    expect(screen.getByText('Click to view price graph')).toBeInTheDocument();
  });

  test('opens modal when card is clicked', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockResolvedValueOnce({
        data: [
          { timestamp: '2023-12-01T10:00:00Z', nalcoPrice: 50000 },
          { timestamp: '2023-12-02T10:00:00Z', nalcoPrice: 52000 },
          { timestamp: '2023-12-03T10:00:00Z', nalcoPrice: 48000 }
        ]
      });

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('NALCO Price Graph')).toBeInTheDocument();
    });
  });

  test('shows loading state when fetching graph data', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    expect(screen.getByText('Loading price data...')).toBeInTheDocument();
  });

  test('displays graph data when available', async () => {
    const mockGraphData = [
      { timestamp: '2023-12-01T10:00:00Z', nalcoPrice: 50000 },
      { timestamp: '2023-12-02T10:00:00Z', nalcoPrice: 52000 },
      { timestamp: '2023-12-03T10:00:00Z', nalcoPrice: 48000 }
    ];

    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockResolvedValueOnce({
        data: mockGraphData
      });

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('Price Range Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Data Points:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // 3 data points
      expect(screen.getByTestId('chart-mock')).toBeInTheDocument(); // Chart component
    });
  });

  test('shows highest and lowest prices', async () => {
    const mockGraphData = [
      { timestamp: '2023-12-01T10:00:00Z', nalcoPrice: 50000 },
      { timestamp: '2023-12-02T10:00:00Z', nalcoPrice: 52000 },
      { timestamp: '2023-12-03T10:00:00Z', nalcoPrice: 48000 }
    ];

    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockResolvedValueOnce({
        data: mockGraphData
      });

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('₹ 52.00')).toBeInTheDocument(); // Highest (52000/1000)
      expect(screen.getByText('₹ 48.00')).toBeInTheDocument(); // Lowest (48000/1000)
    });
  });

  test('handles keyboard navigation', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockResolvedValueOnce({
        data: [{ timestamp: '2023-12-01T10:00:00Z', nalcoPrice: 50000 }]
      });

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('NALCO Price Graph')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockRejectedValueOnce(new Error('API Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching NALCO graph data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test('shows empty state when no graph data', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockResolvedValueOnce({
        data: []
      });

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('No graph data available')).toBeInTheDocument();
    });
  });

  test('closes modal when close button is clicked', async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: { nalcoPrice: 50000 }
      })
      .mockResolvedValueOnce({
        data: [{ timestamp: '2023-12-01T10:00:00Z', nalcoPrice: 50000 }]
      });

    render(<Nalco />);

    const card = screen.getByRole('button', { name: /Click to view NALCO price graph/ });
    fireEvent.click(card);

    await waitFor(() => {
      expect(screen.getByText('NALCO Price Graph')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: '' }); // Close button
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('NALCO Price Graph')).not.toBeInTheDocument();
    });
  });
});
