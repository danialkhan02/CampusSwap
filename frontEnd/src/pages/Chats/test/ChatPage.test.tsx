import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { chats } from 'utils/spaUrls';
import activeChatsData from 'pages/Chats/test/mocks/activeChats';
import chatHistoryData from 'pages/Chats/test/mocks/chatHistory';
import ChatPage from 'pages/Chats/ChatPage';
import { useGetActiveChats } from 'pages/Chats/queries';
import userEvent from '@testing-library/user-event';
import { useChat } from 'contexts/ChatContext';


window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('contexts/ChatContext', () => ({
  __esModule: true,
  ChatProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useChat: jest.fn(),
}));

jest.mock('pages/Chats/queries', () => ({
  ...jest.requireActual('pages/Chats/queries'),
  useGetActiveChats: jest.fn(),
  useGetChatHistory: jest.fn(),
}));

const mockChatContext = {
  sendMessage: jest.fn(),
  messages: chatHistoryData,
  isLoading: false,
  connectionStatus: 'connected',
  setSelectedUserId: jest.fn(),
};

const queryClient = new QueryClient();

function renderChatPage(): void {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[chats.base]}>
        <Routes>
          <Route
            path={chats.base}
            element={<ChatPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ChatPage Component', () => {
  beforeEach(() => {
    (useGetActiveChats as jest.Mock).mockReturnValue({
      data: activeChatsData,
      isLoading: false,
    });
  });

  it('should render the messages title', () => {
    renderChatPage();
    expect(screen.getByText(/messages/i)).toBeInTheDocument();
  });

  it('should render the search input field with placeholder', () => {
    renderChatPage();
    const searchInput = screen.getByPlaceholderText(/search.../i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render 2 active chats', () => {
    renderChatPage();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('should render active chats with the following names', () => {
    renderChatPage();
    expect(screen.getByRole('button', { name: /John Doe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /John Smith/i })).toBeInTheDocument();
  });

  it('should allow typing in the search input field', async () => {
    renderChatPage();
    const searchInput = screen.getByPlaceholderText(/search.../i);
    await userEvent.type(searchInput, 'John D');
    expect(searchInput).toHaveValue('John D');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should show the chat window', async () => {
    renderChatPage();
    (window.HTMLElement.prototype.scrollIntoView as jest.Mock).mockClear();
    (useChat as jest.Mock).mockImplementation(() => mockChatContext);
    const user = userEvent.setup();

    const chat = screen.getByRole('button', { name: /John Doe/i });
    await user.click(chat);

    const messageInput = await screen.findByTestId('message-type-textbox');

    expect(messageInput).toBeInTheDocument();
  });
});
