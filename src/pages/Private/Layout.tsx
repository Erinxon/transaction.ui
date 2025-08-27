import type { ReactNode } from "react"
import { AppRoutes } from "../../models/AppRoutes";
import { MenuLink } from "../../components";
import { useAuth } from "../../core/auth/context/useAuth";

interface Props {
    children: ReactNode
}

export const Layout = ({ children }: Props) => {
    const { logout } = useAuth();
    return (
        <>
            <div className="bg-gray-100 min-h-screen">
                <div className="fixed inset-y-0 left-0 w-64 bg-emerald-800 text-white transition-all duration-300 z-10">
                    <div className="flex items-center justify-center h-16 border-b border-emerald-700">
                        <h1 className="text-xl font-bold">Finance App</h1>
                    </div>
                    <nav className="mt-5">
                        <MenuLink 
                        name="Dashboard" 
                        icon="fas fa-home mr-3" 
                        to={`${AppRoutes.private.root}/${AppRoutes.private.dashboard}`}
                        className="flex items-center px-6 py-3 text-white hover:bg-emerald-700" 
                        activeClassName="bg-emerald-900"/>

                        <MenuLink 
                        name="Transactions" 
                        icon="fas fa-exchange-alt mr-3" 
                        to={`${AppRoutes.private.root}/${AppRoutes.private.transactions}`}
                        className="flex items-center px-6 py-3 text-white hover:bg-emerald-700" 
                        activeClassName="bg-emerald-900"/>

                       <MenuLink 
                        name="Profile" 
                        icon="fas fa-user mr-3" 
                        to={`${AppRoutes.private.root}/${AppRoutes.private.profile}`}
                        className="flex items-center px-6 py-3 text-white hover:bg-emerald-700" 
                        activeClassName="bg-emerald-900"/>

                        <MenuLink 
                        name="Logout" 
                        icon="fas fa-sign-out-alt mr-3" 
                        to={`${AppRoutes.login}`}
                        className="flex items-center px-6 py-3 text-white hover:bg-emerald-700 mt-auto"
                        onClick={logout}/>
                    </nav>
                </div>
                {children}
            </div>
        </>
    )
}