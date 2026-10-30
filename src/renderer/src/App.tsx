import React from 'react'
import { AuthProvider } from './context/AuthContext'
import { AppRoutes } from './route/AppRoutes'

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
