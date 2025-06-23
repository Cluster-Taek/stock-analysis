import AlertProvider from './alert-provider';
import { QueryProvider } from './query-provider';

interface ICoreProviderProps {
  children?: React.ReactNode;
}

const CoreProvider = ({ children }: ICoreProviderProps) => {
  return (
    <AlertProvider>
      <QueryProvider>{children}</QueryProvider>
    </AlertProvider>
  );
};

export default CoreProvider;
