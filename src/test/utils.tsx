/* eslint-disable react-refresh/only-export-components */
import { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface WrapperProps {
  children: ReactNode;
  initialEntries?: string[];
}

function Wrapper({ children, initialEntries = ["/"] }: WrapperProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

const customRender = (ui: React.ReactElement, options?: RenderOptions & { initialEntries?: string[] }) => {
  const { initialEntries, ...rest } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => <Wrapper initialEntries={initialEntries}>{children}</Wrapper>,
    ...rest,
  });
};

export {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
export { customRender as render };