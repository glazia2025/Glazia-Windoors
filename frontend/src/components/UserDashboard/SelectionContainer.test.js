import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import SelectionContainer from './SelectionContainer';
import selectionReducer from '../../redux/selectionSlice';
import userReducer from '../../redux/userSlice';

// Mock the components that are not relevant for this test
jest.mock('./ProfileOptions', () => {
  return function MockProfileOptions() {
    return <div data-testid="profile-options">Profile Options</div>;
  };
});

jest.mock('./HardwareOptions', () => {
  return function MockHardwareOptions() {
    return <div data-testid="hardware-options">Hardware Options</div>;
  };
});

jest.mock('./AcessoriesOptions', () => {
  return function MockAccessoriesOptions() {
    return <div data-testid="accessories-options">Accessories Options</div>;
  };
});

jest.mock('./Nalco/Nalco', () => {
  return function MockNalco() {
    return <div data-testid="nalco">Nalco</div>;
  };
});

// Mock API calls
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  BASE_API_URL: 'http://localhost:3001'
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      selection: selectionReducer,
      user: userReducer,
    },
    preloadedState: {
      selection: {
        selectedOption: 'profile',
        activeProfile: null,
        activeOption: null,
        productsByOption: {
          profile: [
            {
              sapCode: 'TEST001',
              description: 'Test Product 1',
              rate: 100,
              quantity: 2,
              amount: '200.00',
              option: 'profile'
            },
            {
              sapCode: 'TEST002',
              description: 'Test Product 2',
              rate: 150,
              quantity: 1,
              amount: '150.00',
              option: 'profile'
            }
          ],
          hardware: [],
          accessories: [],
        },
      },
      user: {
        user: {
          _id: 'user123',
          name: 'Test User',
          city: 'Test City',
          phoneNumber: '1234567890',
          address: 'Test Address',
          state: 'Test State',
          pincode: '123456',
          gstNumber: 'TEST123456789'
        }
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component, { store = createTestStore() } = {}) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('SelectionContainer Cart Functionality', () => {
  let mockSetIsSliderOpen;

  beforeEach(() => {
    mockSetIsSliderOpen = jest.fn();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders cart slider when isSliderOpen is true', () => {
    renderWithProviders(
      <SelectionContainer isSliderOpen={true} setIsSliderOpen={mockSetIsSliderOpen} />
    );

    expect(screen.getByText('Selected Products')).toBeInTheDocument();
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
  });

  test('displays quantity controls for each product', () => {
    renderWithProviders(
      <SelectionContainer isSliderOpen={true} setIsSliderOpen={mockSetIsSliderOpen} />
    );

    // Check for quantity controls (plus and minus buttons)
    const minusButtons = screen.getAllByRole('button');
    const plusButtons = screen.getAllByRole('button');
    
    // Should have minus and plus buttons for each product
    expect(minusButtons.some(btn => btn.querySelector('.fa-minus'))).toBeTruthy();
    expect(plusButtons.some(btn => btn.querySelector('.fa-plus'))).toBeTruthy();
  });

  test('displays delete buttons for each product', () => {
    renderWithProviders(
      <SelectionContainer isSliderOpen={true} setIsSliderOpen={mockSetIsSliderOpen} />
    );

    // Check for delete buttons (trash icons)
    const deleteButtons = screen.getAllByRole('button');
    expect(deleteButtons.some(btn => btn.querySelector('.fa-trash'))).toBeTruthy();
  });

  test('calculates totals correctly', () => {
    renderWithProviders(
      <SelectionContainer isSliderOpen={true} setIsSliderOpen={mockSetIsSliderOpen} />
    );

    // Sub total should be 200 + 150 = 350
    expect(screen.getByText('₹ 350.00')).toBeInTheDocument();
    
    // GST should be 350 * 0.18 = 63.00
    expect(screen.getByText('₹ 63.00')).toBeInTheDocument();
    
    // Total should be 350 + 63 = 413.00
    expect(screen.getByText('₹ 413.00')).toBeInTheDocument();
  });

  test('closes cart when overlay is clicked', () => {
    renderWithProviders(
      <SelectionContainer isSliderOpen={true} setIsSliderOpen={mockSetIsSliderOpen} />
    );

    const overlay = document.querySelector('.overlay');
    fireEvent.click(overlay);

    expect(mockSetIsSliderOpen).toHaveBeenCalledWith(false);
  });

  test('closes cart when close button is clicked', () => {
    renderWithProviders(
      <SelectionContainer isSliderOpen={true} setIsSliderOpen={mockSetIsSliderOpen} />
    );

    const closeButton = screen.getByRole('button', { name: /times/i });
    fireEvent.click(closeButton);

    expect(mockSetIsSliderOpen).toHaveBeenCalledWith(false);
  });
});
