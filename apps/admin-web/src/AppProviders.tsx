import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const AppProviders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default AppProviders
