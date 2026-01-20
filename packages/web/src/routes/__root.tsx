import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Footer from "@/components/share/footer";
import Header from '@/components/share/header';
import { ErrorComponent } from '@/components/share/error-component';


const RootLayout = () => (
  <>
    <Header />
    <Outlet />
    <TanStackRouterDevtools />
    <Footer />
  </>
)

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorComponent
})
