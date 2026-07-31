import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoalsProvider } from '@/context/GoalsProvider'
import { RiLayout, ZoneLayout, DistrictLayout, ClubLayout, AdminLayout } from '@/layouts/Layouts'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminDistricts from '@/pages/admin/Districts'

import RiOverview from '@/pages/ri/Overview'
import RiCoordinators from '@/pages/ri/Coordinators'
import RiGoals from '@/pages/ri/Goals'

import ZoneOverview from '@/pages/zone/Overview'
import Coordinators from '@/pages/zone/Coordinators'
import ZoneDistricts from '@/pages/zone/Districts'
import ZoneGoals from '@/pages/zone/Goals'
import FoundationGrid from '@/pages/zone/FoundationGrid'
import MonthlyReport from '@/pages/zone/MonthlyReport'

import DistrictOverview from '@/pages/district/Overview'
import DistrictClubs from '@/pages/district/Clubs'
import DistrictGoals from '@/pages/district/Goals'

import ClubOverview from '@/pages/club/Overview'
import ClubGoals from '@/pages/club/Goals'

export default function App() {
  return (
    <GoalsProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Navigate to="/admin" replace />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="districts" element={<AdminDistricts />} />
          </Route>


          <Route path="/ri" element={<RiLayout />}>
            <Route index element={<Navigate to="/ri/overview" replace />} />
            <Route path="overview" element={<RiOverview />} />
            <Route path="coordinators" element={<RiCoordinators />} />
            <Route path="zones" element={<Navigate to="/ri/overview" replace />} />
            <Route path="goals" element={<RiGoals />} />
          </Route>

          <Route path="/zone" element={<ZoneLayout />}>
            <Route index element={<Navigate to="/zone/overview" replace />} />
            <Route path="overview" element={<ZoneOverview />} />
            <Route path="coordinators" element={<Coordinators />} />
            <Route path="districts" element={<ZoneDistricts />} />
            <Route path="goals" element={<ZoneGoals />} />
            <Route path="foundation" element={<FoundationGrid />} />
            <Route path="monthly-report" element={<MonthlyReport />} />
          </Route>

          <Route path="/district/:districtId" element={<DistrictLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DistrictOverview />} />
            <Route path="clubs" element={<DistrictClubs />} />
            <Route path="goals" element={<DistrictGoals />} />
          </Route>

          <Route path="/club/:clubId" element={<ClubLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<ClubOverview />} />
            <Route path="goals" element={<ClubGoals />} />
          </Route>

          <Route path="*" element={<Navigate to="/ri/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </GoalsProvider>
  )
}
