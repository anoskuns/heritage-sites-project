import { AppProviders } from './app/providers'
import { MainLayout } from './components/layout'

function App() {
  return (
    <AppProviders>
      <MainLayout />
    </AppProviders>
  )
}

export default App
