import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '../pages/auth/LoginPage'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { MilkCollectionPage } from '../pages/operations/MilkCollectionPage'
import { MacineConnection } from '../pages/operations/macineconnection/MacineConnection'
import { ProcurementCollection } from '../pages/operations/procurementcollection/ProcurementCollection'
import { DynamicRoutePage } from '../pages/common/DynamicRoutePage'

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Simple Login Page (zero validation, direct navigation) */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Panel Layout & Operations */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="farmers" element={<DashboardPage />} />
          <Route path="collection" element={<MilkCollectionPage />} />
          <Route path="macine-connection" element={<MacineConnection />} />
          <Route path="procurement-collection" element={<ProcurementCollection />} />
          <Route path="*" element={<DynamicRoutePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default AppRoutes
