import './style/App.css'
import Header from '../components/Header'
import Designer from '../components/Designer'
import { ChainSpecProvider } from '../contexts/ChainSpecContext'

function App() {
  return (
    <ChainSpecProvider>
      <Header />
      <Designer />
    </ChainSpecProvider>
  )
}

export default App
