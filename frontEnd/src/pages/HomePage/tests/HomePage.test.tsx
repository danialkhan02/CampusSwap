import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from 'pages/HomePage/HomePage';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { homepage } from 'utils/spaUrls';
import { useGetProductDetails, useGetProductList } from 'pages/HomePage/queries';
import mockProductsData from 'pages/HomePage/tests/mocks/mockProduct';
import mockSingleProductData from 'pages/HomePage/tests/mocks/mockProductData';
import ProductDetails from 'pages/HomePage/ProductDetails';
import React from 'react';


jest.mock('pages/HomePage/queries', () => ({
  ...jest.requireActual('pages/HomePage/queries'),
  useGetProductList: jest.fn(),
  useGetProductDetails: jest.fn(),
}));

const queryClient = new QueryClient();

function renderHomePage(): void {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[homepage]}>
        <Routes>
          <Route
            path={homepage}
            element={<HomePage />}
          />
          <Route
            path='/product/:productId'
            element={<ProductDetails />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HomePage Component', () => {
  beforeEach(() => {
    (useGetProductList as jest.Mock).mockReturnValue({
      data: mockProductsData,
      isLoading: false,
    });
  });

  it('should render the shop title', () => {
    renderHomePage();
    expect(screen.getByText(/shop/i)).toBeInTheDocument();
  });

  it('should render the search input field with placeholder', () => {
    renderHomePage();
    const searchInput = screen.getByPlaceholderText(/search.../i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render filter and sort buttons', () => {
    renderHomePage();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by: featured/i })).toBeInTheDocument();
  });

  it('should render the correct number of product cards', () => {
    renderHomePage();
    const productCards = screen.getAllByTestId('product-card');
    expect(productCards.length).toBe(6);
  });

  it('should display product name, price, and seller info correctly in product cards', () => {
    renderHomePage();

    const products = screen.getAllByText(/urban explorer sneakers/i);
    const prices = screen.getAllByText(/\$35.71/i);
    const address = screen.getAllByText(/450 Front St W./i);
    expect(products[0]).toBeInTheDocument();
    expect(prices[0]).toBeInTheDocument();
    expect(address[0]).toBeInTheDocument();

    const products2 = screen.getAllByText(/classic leather loafers/i);
    const prices2 = screen.getAllByText(/\$35.54/i);
    expect(products2[0]).toBeInTheDocument();
    expect(prices2[0]).toBeInTheDocument();
  });

  it('should allow typing in the search input field', async () => {
    renderHomePage();
    const searchInput = screen.getByPlaceholderText(/search.../i);
    await userEvent.type(searchInput, 'sneakers');
    expect(searchInput).toHaveValue('sneakers');
  });

  it('should open filters on button click', async () => {
    renderHomePage();

    const filterButton = screen.getByRole('button', { name: /filters/i });

    userEvent.click(filterButton);

    expect(await screen.findByText('Condition')).toBeInTheDocument();
    expect(await screen.findByText('New')).toBeInTheDocument();
    expect(await screen.findByText('Used')).toBeInTheDocument();

    expect(await screen.findByText('Category')).toBeInTheDocument();
    expect(await screen.findByText('Textbook')).toBeInTheDocument();
    expect(await screen.findByText('Clothing')).toBeInTheDocument();
    expect(await screen.findByText('Musical Instruments')).toBeInTheDocument();

    expect(await screen.findByText('Price')).toBeInTheDocument();
    expect(await screen.findByText('$0')).toBeInTheDocument();
    expect(await screen.findByText('200')).toBeInTheDocument();

    expect(await screen.findByText('Location')).toBeInTheDocument();

    expect(await screen.findByText('Cancel')).toBeInTheDocument();
    expect(await screen.findByText('Apply Filters')).toBeInTheDocument();
  });

  it('should open sort by dropdown on user click', async () => {
    renderHomePage();

    const sortByButton = screen.getByRole('button', { name: /Sort By: Featured/i });

    userEvent.click(sortByButton);

    expect(await screen.findAllByText('Featured')).toHaveLength(1);
    expect(await screen.findAllByText('Price')).toHaveLength(2);
    expect(await screen.findAllByText('Date Posted')).toHaveLength(2);

    expect(await screen.findByText('Cancel')).toBeInTheDocument();
    expect(await screen.findByText('Apply')).toBeInTheDocument();
  });

  it('should navigate to product details page on card click', async () => {
    renderHomePage();
    (useGetProductDetails as jest.Mock).mockReturnValue({
      data: mockSingleProductData,
      isLoading: false,
    });
    const user = userEvent.setup();

    const productLink = screen.getAllByTestId('product-card-link')[0];
    await user.click(productLink);

    expect(await screen.findByText(/Urban Explorer Sneakers/i)).toBeInTheDocument();
  });
});
