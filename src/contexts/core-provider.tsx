import AlertProvider from './alert-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from 'next-themes';

interface ICoreProviderProps {
  children?: React.ReactNode;
}

const CoreProvider = ({ children }: ICoreProviderProps) => {
  return (
    <ThemeProvider themes={['light', 'dark']} enableSystem={false} disableTransitionOnChange={false}>
      <AlertProvider>
        <QueryProvider>{children}</QueryProvider>
      </AlertProvider>
    </ThemeProvider>
  );
};

export default CoreProvider;
