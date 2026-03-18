import { BrowserRouter, Navigate, Route } from 'react-router-dom'
import { RoutesWithNotFound } from './components'
import { AppRoutes } from './models/AppRoutes'
import { PrivateGuard } from './guard/PrivateGuard'
import { ForgotPassword, Login, Register, ResetPassword } from './pages/auth'
import { PrivateRouter } from './pages/Private/PrivateRouter'
import ConfirmAccount from './pages/auth/ConfirmAccount'

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <RoutesWithNotFound>
        <Route path="/" element={<Navigate to={AppRoutes.private.root} />} />
        <Route path={AppRoutes.login} element={<Login />} />
        <Route path={AppRoutes.register} element={<Register />} />
        <Route path={AppRoutes.confirmAccount} element={<ConfirmAccount />} />
        <Route path={AppRoutes.forgotPassword} element={<ForgotPassword />} />
        <Route path={AppRoutes.resetPassword} element={<ResetPassword />} />
        {/* Private Routes */}
        <Route element={<PrivateGuard />}>
          <Route path={`${AppRoutes.private.root}/*`} element={<PrivateRouter />} />
        </Route>
      </RoutesWithNotFound >
    </BrowserRouter>
  )
}