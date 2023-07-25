import './style/App.css'
import Header from '../components/Header'
import Designer from '../components/Designer'
import { ChainSpecProvider } from '../contexts/ChainSpecContext'
import LLMContextProvider from '../contexts/LLMContext'
import Interaction from '../components/Interaction'
import EditLLMs from './EditLLMs'
import ImportChain  from './ImportChain'

function App() {
  return (
    <LLMContextProvider>
      <ChainSpecProvider>
        <Header />
        <Designer />
        <Interaction />
        <EditLLMs />
      </ChainSpecProvider>
    </LLMContextProvider>
  )
}

export default App
