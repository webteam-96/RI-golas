import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoalsProvider } from '@/context/GoalsProvider'
import { RiLayout, ZoneLayout, DistrictLayout, ClubLayout } from '@/layouts/Layouts'
import ConsolidatedGoals from '@/pages/admin/Dashboard'
import AllDistricts from '@/pages/admin/Districts'
import DistrictDetail from '@/pages/admin/DistrictDetail'

import RiCoordinators from '@/pages/ri/Coordinators'

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
          <Route index element={<Navigate to="/ri/consolidated" replace />} />

          {/* The admin surface moved under the RI Director, who is the administrator. */}
          <Route path="/admin" element={<Navigate to="/ri/consolidated" replace />} />
          <Route path="/admin/districts" element={<Navigate to="/ri/districts" replace />} />


          <Route path="/ri" element={<RiLayout />}>
            <Route index element={<Navigate to="/ri/consolidated" replace />} />
            <Route path="consolidated" element={<ConsolidatedGoals />} />
            <Route path="districts" element={<AllDistricts />} />
            <Route path="districts/:districtId" element={<DistrictDetail />} />
            <Route path="coordinators" element={<RiCoordinators />} />
            {/* Retired from the RI Director: both ran on the Zone 6 dataset and disagreed
                with the consolidated view. They remain under the Zone role. */}
            <Route path="overview" element={<Navigate to="/ri/consolidated" replace />} />
            <Route path="zones" element={<Navigate to="/ri/consolidated" replace />} />
            <Route path="goals" element={<Navigate to="/ri/consolidated" replace />} />
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
