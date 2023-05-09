import './style/App.css'
import Header from '../components/Header'
import Designer from '../components/Designer'
import { ChainSpecProvider } from '../contexts/ChainSpecContext'
import Interaction from '../components/Interaction'

function App() {
  return (
    <ChainSpecProvider>
      <Header />
      <Designer />
      <Interaction />
    </ChainSpecProvider>
  )
}

export default App
