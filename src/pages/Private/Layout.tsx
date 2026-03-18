import { useEffect, useState, type ReactNode } from "react"
import { AppRoutes } from "../../models/AppRoutes";
import { MenuLink } from "../../components";
import { useAuth } from "../../core/auth/context/useAuth";
import { isAdminToken } from "../../utils";

interface Props {
    children: ReactNode
}

export const Layout = ({ children }: Props) => {
    const { logout } = useAuth();
    const isAdmin = isAdminToken(localStorage.getItem('accessToken'));
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState<boolean>(() => window.innerWidth < 1024);

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
                                name="Dashboard" 
                                icon="fas fa-chart-line" 
                                to={`${AppRoutes.private.root}/${AppRoutes.private.dashboard}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name="Transactions" 
                                icon="fas fa-receipt" 
                                to={`${AppRoutes.private.root}/${AppRoutes.private.transactions}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name="Profile" 
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
                                name="Dashboard"
                                icon="fas fa-shield-halved"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.dashboard}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name="Logs"
                                icon="fas fa-scroll"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.logs}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name="Auditoria"
                                icon="fas fa-magnifying-glass-chart"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.audit}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />

                            <MenuLink
                                name="Usuarios"
                                icon="fas fa-users-gear"
                                to={`${AppRoutes.private.root}/${AppRoutes.private.admin.root}/${AppRoutes.private.admin.users}`}
                                className="app-nav-link"
                                activeClassName="is-active"
                                onClick={closeSidebar}
                            />
                        </>
                    )}

                    <MenuLink
                        name="Logout" 
                        icon="fas fa-arrow-right-from-bracket" 
                        to={`${AppRoutes.login}`}
                        className="app-nav-link mt-6"
                        onClick={() => {
                            logout();
                            closeSidebar();
                        }}
                    />
                </nav>
            </aside>

            {sidebarOpen && (
                <button
                    aria-label="Close navigation"
                    className="fixed inset-0 bg-black/30 z-20 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            <div className="app-main fade-in-up">
                {isMobileView && !sidebarOpen && (
                    <div className="app-topbar fixed left-3 top-3 z-50">
                        <button
                            className="btn-modern btn-secondary"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <i className="fas fa-bars mr-2" />
                            Menu
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}