import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from 'pages/HomePage/HomePage';
import '@testing-library/jest-dom';


describe('HomePage Component', () => {
  it('should render the shop title', () => {
    render(<HomePage />);
    expect(screen.getByText(/shop/i)).toBeInTheDocument();
  });

  it('should render the search input field with placeholder', () => {
    render(<HomePage />);
    const searchInput = screen.getByPlaceholderText(/search.../i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render filter and sort buttons', () => {
    render(<HomePage />);
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort by: featured/i })).toBeInTheDocument();
  });

  it('should render the correct number of product cards', () => {
    render(<HomePage />);
    const productCards = screen.getAllByTestId('product-card');
    expect(productCards.length).toBe(6);
  });

  it('should display product name, price, and sale status correctly in product cards', () => {
    render(<HomePage />);

    const products = screen.getAllByText(/urban explorer sneakers/i);
    const prices = screen.getAllByText(/\$35.71/i);
    const sales = screen.getAllByText(/sale/i);
    expect(products[0]).toBeInTheDocument();
    expect(prices[0]).toBeInTheDocument();
    expect(sales[0]).toBeInTheDocument();

    const products2 = screen.getAllByText(/classic leather loafers/i);
    const prices2 = screen.getAllByText(/\$35.54/i);
    expect(products2[0]).toBeInTheDocument();
    expect(prices2[0]).toBeInTheDocument();
  });

  it('should allow typing in the search input field', async () => {
    render(<HomePage />);
    const searchInput = screen.getByPlaceholderText(/search.../i);
    await userEvent.type(searchInput, 'sneakers');
    expect(searchInput).toHaveValue('sneakers');
  });

  it('should open filters and sort options on button click', () => {
    render(<HomePage />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    const sortButton = screen.getByRole('button', { name: /sort by: featured/i });

    userEvent.click(filterButton);
    userEvent.click(sortButton);
  });
});
