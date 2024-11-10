import { FC } from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { useGetListerWishList } from 'pages/HomePage/queries';
import { retrieve } from 'utils/cacheUtils';
import UserWishlist from '../components/UserWishlist';


// Mock components
jest.mock('components/Common/Spinner', () => ({
  __esModule: true,
  default: (() => <div data-testid='spinner'>Loading...</div>) as FC,
}));

interface ProductListProps {
  onApplyFilter: () => void;
  onClearFilters: () => void;
  onApplySort: () => void;
  onApplySearch: () => void;
  productsData: {
    data: {
      total: number;
    };
  };
}

jest.mock('pages/HomePage/components/ProductList', () => ({
  __esModule: true,
  default: ((props: ProductListProps) => (
    <div data-testid='product-list'>
      <button type='button' onClick={props.onApplyFilter}>
        Apply Filter
      </button>
      <button type='button' onClick={props.onClearFilters}>
        Clear Filters
      </button>
      <button type='button' onClick={props.onApplySort}>
        Apply Sort
      </button>
      <button type='button' onClick={props.onApplySearch}>
        Apply Search
      </button>
      <div>
        Total Items:
        {props.productsData.data.total}
      </div>
    </div>
  )) as FC<ProductListProps>,
}));

// Mock hooks and utilities
jest.mock('pages/HomePage/queries', () => ({
  useGetListerWishList: jest.fn(),
  convertFiltersToQueryParams: jest.fn(),
  listerProductListQueryKey: jest.fn(() => ({ key: 'test-key' })),
}));

jest.mock('utils/cacheUtils', () => ({
  retrieve: jest.fn(),
}));

// Create mock data
const createMockProductsData = (total = 10, limit = 5) => ({
  data: {
    items: Array.from({ length: Math.min(total, limit) }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      price: (i + 1) * 100,
    })),
    total,
    limit,
  },
});

describe('UserWishlist', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (retrieve as jest.Mock).mockReturnValue(mockUserId);
    (useGetListerWishList as jest.Mock).mockReturnValue({
      data: createMockProductsData(),
      isLoading: false,
    });
  });

  describe('Initial Rendering', () => {
    it('shows loading spinner when data is loading', () => {
      (useGetListerWishList as jest.Mock).mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(<UserWishlist />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('displays wishlist title and products when data is loaded', () => {
      render(<UserWishlist />);
      expect(screen.getByText('Wishlist')).toBeInTheDocument();
      expect(screen.getByTestId('product-list')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('displays pagination when there are multiple pages', () => {
      (useGetListerWishList as jest.Mock).mockReturnValue({
        data: createMockProductsData(20, 5), // 20 total items, 5 per page = 4 pages
        isLoading: false,
      });

      render(<UserWishlist />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('does not display pagination for single page results', () => {
      (useGetListerWishList as jest.Mock).mockReturnValue({
        data: createMockProductsData(5, 5), // 5 total items, 5 per page = 1 page
        isLoading: false,
      });

      render(<UserWishlist />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('changes page when pagination is clicked', async () => {
      (useGetListerWishList as jest.Mock).mockReturnValue({
        data: createMockProductsData(20, 5),
        isLoading: false,
      });

      render(<UserWishlist />);

      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(useGetListerWishList).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({ page: 2 }),
          expect.any(Object),
        );
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('resets to page 1 when applying filters', async () => {
      render(<UserWishlist />);

      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);

      const applyFilterButton = screen.getByRole('button', { name: /apply filter/i });
      fireEvent.click(applyFilterButton);

      await waitFor(() => {
        expect(useGetListerWishList).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({ page: 1 }),
          expect.any(Object),
        );
      });
    });

    it('resets to page 1 when applying sort', async () => {
      render(<UserWishlist />);

      const applySortButton = screen.getByRole('button', { name: /apply sort/i });
      fireEvent.click(applySortButton);

      await waitFor(() => {
        expect(useGetListerWishList).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({ page: 1 }),
          expect.any(Object),
        );
      });
    });

    it('resets filters to default when clear is clicked', async () => {
      render(<UserWishlist />);

      const clearFiltersButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearFiltersButton);

      await waitFor(() => {
        expect(useGetListerWishList).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({ page: 1 }),
          expect.any(Object),
        );
      });
    });
  });

  describe('Search Functionality', () => {
    it('resets to page 1 when applying search', async () => {
      render(<UserWishlist />);

      const applySearchButton = screen.getByRole('button', { name: /apply search/i });
      fireEvent.click(applySearchButton);

      await waitFor(() => {
        expect(useGetListerWishList).toHaveBeenCalledWith(
          mockUserId,
          expect.objectContaining({ page: 1 }),
          expect.any(Object),
        );
      });
    });
  });
});

