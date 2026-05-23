import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import { BrowserRouter } from 'react-router-dom'
import type { PropsWithChildren } from 'react'
import { AuthProvider } from './AuthProvider'
import { Toaster } from 'sonner'

const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default AppProviders
