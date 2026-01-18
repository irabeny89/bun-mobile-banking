import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Footer from "@/components/share/footer";

const RootLayout = () => (
  <>
    <Outlet />
    <TanStackRouterDevtools />
    <Footer />
  </>
)

export const Route = createRootRoute({ component: RootLayout })