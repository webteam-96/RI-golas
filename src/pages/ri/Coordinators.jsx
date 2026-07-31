import { ZONE } from '@/data/zone6'
import { districtsIn, GOALS_YEAR } from '@/data/disha'
import { LevelBanner } from '@/components/Bits'
import CoordinatorList from '@/components/CoordinatorList'

export default function RiCoordinators() {
  return (
    <>
      <LevelBanner
        eyebrow={`RI Director Office · Rotary Foundation team · ${GOALS_YEAR}`}
        title="Foundation Coordinators"
        sub={`1 RRFC · ${ZONE.coordinators.length} ARRFCs across ${districtsIn(2).length} Zone 6 districts`}
      />
      <CoordinatorList />
    </>
  )
}
