import { ZONE } from '@/data/zone6'
import { districtsIn } from '@/data/disha'
import { LevelBanner } from '@/components/Bits'
import CoordinatorList from '@/components/CoordinatorList'

export default function ZoneCoordinators() {
  return (
    <>
      <LevelBanner
        eyebrow={`Zone ${ZONE.number} · Rotary Foundation team`}
        title="Foundation Coordinators"
        sub={`1 RRFC · ${ZONE.coordinators.length} ARRFCs · ${districtsIn(2).length} districts`}
      />
      <CoordinatorList />
    </>
  )
}
