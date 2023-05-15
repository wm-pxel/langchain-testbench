import './style/App.css'
import Header from '../components/Header'
import Designer from '../components/Designer'
import { ChainSpecProvider } from '../contexts/ChainSpecContext'
import LLMContextProvider from '../contexts/LLMContext'
import Interaction from '../components/Interaction'
import EditLLMs from './EditLLMs'

function App() {
  return (
    <ChainSpecProvider>
      <LLMContextProvider>
        <Header />
        <Designer />
        <Interaction />
        <EditLLMs />
      </LLMContextProvider>
    </ChainSpecProvider>
  )
}

export default App
