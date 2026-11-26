import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BoardProvider } from './state/BoardContext.jsx'
import './styles/base.css'
import './styles/layout.css'
import './styles/board.css'
import './styles/card.css'
import './styles/modal.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </React.StrictMode>,
)
