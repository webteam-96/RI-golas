import { ZONE, DISTRICTS } from '@/data/zone6'
import { LevelBanner } from '@/components/Bits'
import CoordinatorList from '@/components/CoordinatorList'

export default function RiCoordinators() {
  return (
    <>
      <LevelBanner
        eyebrow="RI Director Office · Rotary Foundation team"
        title="Foundation Coordinators"
        sub={`1 RRFC · ${ZONE.coordinators.length} ARRFCs across ${DISTRICTS.length} districts`}
      />
      <CoordinatorList />
    </>
  )
}
