import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../../models/AppRoutes";
import { MenuLink } from "../../components";
import { useAuth } from "../../core/auth/context/useAuth";
import { isAdminToken } from "../../utils";
import { useTheme } from "../../core/theme/useTheme";
import { useI18n } from "../../core/i18n/useI18n";

interface Props {
    children: ReactNode
}

export const Layout = ({ children }: Props) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = isAdminToken(localStorage.getItem('accessToken'));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState<boolean>(() => window.innerWidth < 1024);
    const { theme, toggleTheme } = useTheme();
    const { t, toggleLocale, locale } = useI18n();
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
                setLangDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1023px)");

        const updateViewport = () => {
            const mobile = mediaQuery.matches;
            setIsMobileView(mobile);

            if (!mobile) {
                setSidebarOpen(false);
            }
        };

        updateViewport();
        mediaQuery.addEventListener("change", updateViewport);

        return () => {
            mediaQuery.removeEventListener("change", updateViewport);
        };
    }, []);

    const closeSidebar = () => {
        setSidebarOpen(false);
    }

    const handleLogout = () => {
        logout();
        closeSidebar();
        navigate(AppRoutes.login, { replace: true });
    }

    return (
        <div className="app-shell">
            <aside className={`app-sidebar relative ${sidebarOpen ? "is-open" : ""}`}>
                <button
                    aria-label="Close navigation"
                    className="absolute right-3 top-3 z-40 rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-sm text-white lg:hidden"
                    onClick={closeSidebar}
                >
                    <i className="fas fa-xmark" />
                </button>

                <div className="app-brand">
                    <div className="app-brand-mark">
                        <i className="fas fa-wave-square" />
                    </div>
                    <div>
                        <h1 className="app-brand-title">Pulse Ledger</h1>
                        <p className="app-brand-subtitle">Finance cockpit</p>
                    </div>
                </div>

                <nav className="app-nav">
                    {!isAdmin && (
                        <>
                            <MenuLink
                                name={t('nav_dashboard')} 
                                icon="fas fa-chart-line" 
                                to={`${AppRoutes.private.root}/${AppRoutes.private.dashboard}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name={t('nav_transactions')} 
                                icon="fas fa-receipt" 
                                to={`${AppRoutes.private.root}/${AppRoutes.private.transactions}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name={t('nav_profile')} 
                                icon="fas fa-user-pen" 
                                to={`${AppRoutes.private.root}/${AppRoutes.private.profile}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <MenuLink
                                name={t('nav_admin_dashboard')}
                                icon="fas fa-shield-halved"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.dashboard}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name={t('nav_admin_logs')}
                                icon="fas fa-scroll"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.logs}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name={t('nav_admin_audit')}
                                icon="fas fa-magnifying-glass-chart"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.audit}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name={t('nav_admin_users')}
                                icon="fas fa-users-gear"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.users}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name={t('nav_admin_categories')}
                                icon="fas fa-tags"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.categories}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />
                        </>
                    )}

                </nav>
            </aside>

            {sidebarOpen && (
                <button
                    aria-label="Close navigation"
                    className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className="app-main flex flex-col">
                <header className="app-topbar-header">
                    {isMobileView && (
                        <button
                            className="topbar-icon-btn"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <i className="fas fa-bars" />
                        </button>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            className="topbar-icon-btn"
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                        >
                            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />
                        </button>

                        <div className="relative" ref={langDropdownRef}>
                            <button
                                className="topbar-icon-btn flex items-center gap-1.5"
                                onClick={() => setLangDropdownOpen(prev => !prev)}
                                aria-label="Select language"
                            >
                                <span className="text-base leading-none">{locale === 'es' ? '🇪🇸' : '🇺🇸'}</span>
                                <i className="fas fa-chevron-down text-[10px] opacity-60" />
                            </button>
                            {langDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
                                    <button
                                        onClick={() => { if (locale !== 'es') toggleLocale(); setLangDropdownOpen(false); }}
                                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${locale === 'es' ? 'font-semibold text-emerald-600' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <span>🇪🇸</span>
                                        <span>Español</span>
                                        {locale === 'es' && <i className="fas fa-check ml-auto text-xs text-emerald-600" />}
                                    </button>
                                    <button
                                        onClick={() => { if (locale !== 'en') toggleLocale(); setLangDropdownOpen(false); }}
                                        className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${locale === 'en' ? 'font-semibold text-emerald-600' : 'text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <span>🇺🇸</span>
                                        <span>English</span>
                                        {locale === 'en' && <i className="fas fa-check ml-auto text-xs text-emerald-600" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="topbar-divider" />

                        <button
                            className="topbar-icon-btn topbar-logout-btn"
                            onClick={handleLogout}
                            aria-label={t('nav_logout')}
                            title={t('nav_logout')}
                        >
                            <i className="fas fa-arrow-right-from-bracket" />
                        </button>
                    </div>
                </header>
                <div className="app-main-content">
                    {children}
                </div>
            </div>
        </div>
    )
}