import './style/App.css'
import Header from '../components/Header'
import Designer from '../components/Designer'
import { ChainSpecProvider } from '../contexts/ChainSpecContext'
import LLMContextProvider from '../contexts/LLMContext'
import Interaction from '../components/Interaction'
import EditLLMs from './EditLLMs'
import { ModalContextProvider } from '../contexts/ModalContext'

function App() {
  return (
    <LLMContextProvider>
      <ChainSpecProvider>
        <ModalContextProvider>
          <Header />
          <Designer />
          <Interaction />
          <EditLLMs />
        </ModalContextProvider>
      </ChainSpecProvider>
    </LLMContextProvider>
  )
}

export default App
