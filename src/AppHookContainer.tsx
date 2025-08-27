import App from './App'
import './App.css'
import { AppRouter } from './AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './core/auth/context/AuthProvider';
import { ModalProvider } from './components/Modal/context';

const queryClient = new QueryClient();

const AppHookContainer = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ModalProvider>
                    <App>
                        <AppRouter />
                    </App>
                </ModalProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default AppHookContainer;