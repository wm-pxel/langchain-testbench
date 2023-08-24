import './style/App.scss'
import Header from '../components/Header'
import Designer from '../components/Designer'
import { ChainSpecProvider } from '../contexts/ChainSpecContext'
import LLMContextProvider from '../contexts/LLMContext'
import Interaction from '../components/Interaction'
import EditLLMs from './EditLLMs'
import PreviousRuns from './PreviousRuns'
import { ModalContextProvider } from '../contexts/ModalContext'
import PreviousRunsContext from '../contexts/PreviousRunsContext'

function App() {
  return (
    <LLMContextProvider>
      <PreviousRunsContext>
        <ChainSpecProvider>
          <ModalContextProvider>
            <Header />
            <Designer />
            <Interaction />
            <EditLLMs />
            <PreviousRuns />
          </ModalContextProvider>
        </ChainSpecProvider>
      </PreviousRunsContext>
    </LLMContextProvider>
  )
}

export default App
