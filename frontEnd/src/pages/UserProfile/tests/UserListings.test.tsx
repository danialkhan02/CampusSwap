import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import type { FC } from 'react';
import { retrieve } from 'utils/cacheUtils';
import { useGetListerProductList } from 'pages/HomePage/queries';
import UserListings from '../components/UserListings';

interface ListingItem {
  id: string;
  name: string;
  price: number;
  description: string;
  condition: string;
}

interface ProductListProps {
  onApplyFilter: () => void;
  onClearFilters: () => void;
  onApplySort: () => void;
  onApplySearch: () => void;
  productsData: {
    data: {
      total: number;
      items: ListingItem[];
    };
  };
}

// Mock components
jest.mock('components/Common/Spinner', () => ({
  __esModule: true,
  default: function Spinner() {
    return <div data-testid="spinner">Loading...</div>;
  },
}));

function MockProductList({
  onApplyFilter,
  onClearFilters,
  onApplySort,
  onApplySearch,
  productsData,
}: ProductListProps) {
  return (
    <div data-testid="product-list">
      <button type="button" onClick={onApplyFilter}>
        Apply Filter
      </button>
      <button type="button" onClick={onClearFilters}>
        Clear Filters
      </button>
      <button type="button" onClick={onApplySort}>
        Apply Sort
      </button>
      <button type="button" onClick={onApplySearch}>
        Apply Search
      </button>
      <div>
        Total Items:
        {' '}
        {productsData.data.total}
      </div>
      <div>
        {productsData.data.items.map((item) => (
          <div key={item.id} data-testid={`product-${item.id}`}>
            <div>{item.name}</div>
            <div>
              $
              {item.price}
            </div>
            <div>{item.condition}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

jest.mock('../../HomePage/components/ProductList', () => ({
  __esModule: true,
  default: MockProductList,
}));

// Mock hooks and utilities
jest.mock('pages/HomePage/queries', () => ({
  useGetListerProductList: jest.fn(),
  convertFiltersToQueryParams: jest.fn(),
  listerProductListQueryKey: jest.fn(() => ({ key: 'test-key' })),
}));

jest.mock('utils/cacheUtils', () => ({
  retrieve: jest.fn(),
}));

function createMockListingsData(total = 10, limit = 5) {
  return {
    data: {
      items: Array.from({ length: Math.min(total, limit) }, (_, i) => ({
        id: `${i + 1}`,
        name: `Listed Product ${i + 1}`,
        price: (i + 1) * 100,
        description: `Description for product ${i + 1}`,
        condition: i % 2 === 0 ? 'NEW' : 'USED',
        images: [`image-${i + 1}.jpg`],
      })),
      total,
      limit,
    },
  };
}

describe('UserListings', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (retrieve as jest.Mock).mockReturnValue(mockUserId);
    (useGetListerProductList as jest.Mock).mockReturnValue({
      data: createMockListingsData(),
      isLoading: false,
    });
  });

  describe('Initial Rendering', () => {
    it('shows loading spinner when data is loading', () => {
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<UserListings />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('displays listings title and products when data is loaded', () => {
      render(<UserListings />);
      expect(screen.getByText('Listings')).toBeInTheDocument();
      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });

    it('displays correct number of listings', () => {
      const mockData = createMockListingsData(3, 3);
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: mockData,
        isLoading: false,
      });

      render(<UserListings />);
      mockData.data.items.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(`$${item.price}`)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('displays pagination when there are multiple pages', () => {
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: createMockListingsData(20, 5),
        isLoading: false,
      });

      render(<UserListings />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('does not display pagination for single page results', () => {
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: createMockListingsData(5, 5),
        isLoading: false,
      });

      render(<UserListings />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('changes page when pagination is clicked', async () => {
      const mockFn = jest.fn();
      (useGetListerProductList as jest.Mock)
        .mockReturnValue({
          data: createMockListingsData(20, 5),
          isLoading: false,
          refetch: mockFn,
        });

      render(<UserListings />);
      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(mockFn).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 }),
        );
      });
    });
  });

  describe('Filtering and Sorting', () => {
    let mockRefetch: jest.Mock;

    beforeEach(() => {
      mockRefetch = jest.fn();
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: createMockListingsData(20, 5),
        isLoading: false,
        refetch: mockRefetch,
      });
    });

    it('resets to page 1 when applying filters', async () => {
      render(<UserListings />);
      const applyFilterButton = screen.getByRole('button', { name: /apply filter/i });
      fireEvent.click(applyFilterButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });

    it('resets to page 1 when applying sort', async () => {
      render(<UserListings />);
      const applySortButton = screen.getByRole('button', { name: /apply sort/i });
      fireEvent.click(applySortButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });

    it('resets filters to default when clear is clicked', async () => {
      render(<UserListings />);
      const clearFiltersButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearFiltersButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });
  });

  describe('Search Functionality', () => {
    it('resets to page 1 when applying search', async () => {
      const mockRefetch = jest.fn();
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: createMockListingsData(),
        isLoading: false,
        refetch: mockRefetch,
      });

      render(<UserListings />);
      const applySearchButton = screen.getByRole('button', { name: /apply search/i });
      fireEvent.click(applySearchButton);

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when loading fails', () => {
      (useGetListerProductList as jest.Mock).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load listings'),
        isError: true,
      });

      render(<UserListings />);
      expect(screen.getByText('Failed to load listings')).toBeInTheDocument();
    });
  });
});
