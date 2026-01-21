import { StrictMode } from 'react'
import { Toaster } from 'sonner'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Import the generated route tree
import { routeTree } from './routeTree.gen'
import "~/index.css"

// Create a new router instance
const router = createRouter({ routeTree })

// Create a new query client instance
const queryClient = new QueryClient()

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </StrictMode>,
  )
}