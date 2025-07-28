import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthProvider } from './contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-sujsl2q32qtgxpyp.us.auth0.com"
    clientId="YhU5uYWIKRDtOGsRcwWk5AltcSfgvU6Z"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>
  </Auth0Provider>
)
