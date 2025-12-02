import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import RichEditor from './components/RichEditor'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h2>TipTap 리치 에디터 예제</h2>
      <RichEditor />
    </>
  )
}

export default App
