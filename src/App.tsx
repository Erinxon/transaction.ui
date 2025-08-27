import type { ReactNode } from 'react'
import './App.css'

interface Props {
  children: ReactNode
}

function App({ children }: Props) {
  return (
    <>
     {children}
    </>
  )
}

export default App;