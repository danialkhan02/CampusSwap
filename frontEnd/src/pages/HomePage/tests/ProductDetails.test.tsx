import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { product } from 'utils/spaUrls';
import { useGetProductDetails } from 'pages/HomePage/queries';
import mockSingleProductData from 'pages/HomePage/tests/mocks/mockProductData';
import ProductDetails from 'pages/HomePage/ProductDetails';
import React from 'react';


jest.mock('pages/HomePage/queries', () => ({
  ...jest.requireActual('pages/HomePage/queries'),
  useGetProductDetails: jest.fn(),
}));

jest.mock('@react-google-maps/api', () => ({
  useLoadScript: () => ({ isLoaded: true, loadError: null }),
  GoogleMap: ({ children }: {children: React.ReactNode}) => <div data-testid='google-map'>{children}</div>,
  Marker: () => <div data-testid='marker' />,
}));


const queryClient = new QueryClient();

function renderProductDetails(): void {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[product.details]}>
        <Routes>
          <Route
            path={product.details}
            element={<ProductDetails />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProductDetails Component', () => {
  beforeEach(() => {
    (useGetProductDetails as jest.Mock).mockReturnValue({
      data: mockSingleProductData,
      isLoading: false,
    });
  });

  it('should render the product title', () => {
    renderProductDetails();
    expect(screen.getAllByText(/Urban Explorer Sneakers/i)[0]).toBeInTheDocument();
  });

  it('should render product info', () => {
    renderProductDetails();
    expect(screen.getAllByText(/Urban Explorer Sneakers/i)).toHaveLength(2);
    expect(screen.getByText('Blank Blank Blank')).toBeInTheDocument();
    expect(screen.getByText('$35.71')).toBeInTheDocument();
    const categoryChips = screen.getByText(/Category: Textbook/i);
    expect(categoryChips).toBeDefined();
    const conditionChips = screen.getByText(/Condition: New/i);
    expect(conditionChips).toBeDefined();
  });

  it('should render location', () => {
    renderProductDetails();
    expect(screen.getByText('Location: 450 Front St W.')).toBeInTheDocument();
  });

  it('should render two buttons', () => {
    renderProductDetails();
    const wishlistButtonChannel = screen.getByRole('button', { name: 'Add to WishList' });
    expect(wishlistButtonChannel).toBeDefined();
    const SellerButtonChannel = screen.getByRole('button', { name: 'Message Seller' });
    expect(SellerButtonChannel).toBeDefined();
  });
});
