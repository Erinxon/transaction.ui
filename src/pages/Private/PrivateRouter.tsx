import { Navigate, Route } from "react-router-dom"
import { RoutesWithNotFound } from "../../components"
import { Dashboard } from "./dashboard/Dashboard"
import { AppRoutes } from "../../models/AppRoutes"
import { Transactions } from "./transactions/Transactions"
import { Profile } from "./profile/Profile"
import { Layout } from "./Layout"

export const PrivateRouter = () => {
    return (
        <Layout>
            <RoutesWithNotFound>
                <Route path="" element={<Navigate to={AppRoutes.private.dashboard} />} />
                <Route path={AppRoutes.private.dashboard} element={<Dashboard />} />
                <Route path={AppRoutes.private.transactions} element={<Transactions />} />
                <Route path={AppRoutes.private.profile} element={<Profile />} />
            </RoutesWithNotFound>
        </Layout>
    )
}