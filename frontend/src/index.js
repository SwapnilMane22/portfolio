import { render } from 'react-dom'
import App from './App'
import { ThemeProvider } from './contexts/theme'
import { ProfileProvider } from './contexts/ProfileContext'
import { ChatOpenProvider } from './contexts/ChatOpenContext'
import './index.css'

render(
  <ThemeProvider>
    <ProfileProvider>
      <ChatOpenProvider>
        <App />
      </ChatOpenProvider>
    </ProfileProvider>
  </ThemeProvider>,
  document.getElementById('root')
)