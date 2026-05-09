import App from './App'
import './App.css'
import { AppRouter } from './AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './core/auth/context/AuthProvider';
import { ModalProvider } from './components/Modal/context';
import { ThemeProvider } from './core/theme/ThemeProvider';
import { I18nProvider } from './core/i18n/I18nProvider';

const queryClient = new QueryClient();

const AppHookContainer = () => {
    return (
        <I18nProvider>
            <ThemeProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <ModalProvider>
                            <App>
                                <AppRouter />
                            </App>
                        </ModalProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </I18nProvider>
    )
}

export default AppHookContainer;