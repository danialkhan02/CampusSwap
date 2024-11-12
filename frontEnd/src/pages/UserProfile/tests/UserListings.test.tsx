import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { retrieve } from 'utils/cacheUtils';
import { useGetListerProductList } from 'pages/HomePage/queries';
import UserListings from '../components/UserListings';

// Spinner mock
jest.mock('components/Common/Spinner', () => ({
  __esModule: true,
  default: () => <div data-testid='spinner'>Loading...</div>,
}));

// ProductList mock with minimal functionality
jest.mock('../../HomePage/components/ProductList', () => ({
  __esModule: true,
  default: ({ productsData }: { productsData: Record<string, any> }) => (
    <div data-testid='product-list'>
      <div data-testid='total-items'>
        Total Items:
        {productsData.data.total}
      </div>
      <div data-testid='items-container'>
        {productsData.data.items.map((item: Record<string, any>) => (
          <div key={item.id} data-testid='product-item'>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  ),
}));

jest.mock('pages/HomePage/queries');
jest.mock('utils/cacheUtils');

describe('UserListings', () => {
  const mockData = {
    data: {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      total: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (retrieve as jest.Mock).mockReturnValue('test-user');
    (useGetListerProductList as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when data is loading', () => {
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
      });

      render(<UserListings listerId='test-user' />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('displays product list when data is loaded', () => {
      render(<UserListings listerId='test-user' />);
      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });

    it('displays correct number of items', () => {
      render(<UserListings listerId='test-user' />);
      const totalItems = screen.getByTestId('total-items');
      expect(totalItems).toHaveTextContent('Total Items:2');
    });

    it('shows empty state when no data is available', () => {
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: { data: { items: [], total: 0 } },
        isLoading: false,
        isError: false,
      });

      render(<UserListings listerId='test-user' />);
      const totalItems = screen.getByTestId('total-items');
      expect(totalItems).toHaveTextContent('Total Items:0');
    });

    it('renders all product items correctly', () => {
      render(<UserListings listerId='test-user' />);
      const items = screen.getAllByTestId('product-item');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('Item 1');
      expect(items[1]).toHaveTextContent('Item 2');
    });
  });
});
