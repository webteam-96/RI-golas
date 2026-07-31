import { useParams, Navigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { ZONE, signedInCoordinator } from '@/data/zone6'
import { DISHA_DISTRICTS, DISHA_ZONES } from '@/data/disha'
import { CLUBS } from '@/data/clubs'
import { initials } from '@/lib/format'

export function RiLayout() {
  // The RI Director is the administrator — the consolidated view and the Zone 6 hierarchy
  // are both theirs, so they sit in one sidebar rather than behind two identities.
  // One consolidated view, not two. The Zone 6 Overview ran on a different dataset and
  // disagreed with this one field for field; it still lives under the Zone role.
  const nav = [
    { to: '/ri/overview', label: 'Overview' },
    { to: '/ri/districts', label: 'Districts' },
    { to: '/ri/coordinators', label: 'Coordinators' },
  ]
  return (
    <Shell
      nav={nav}
      titles={{
        '/ri/overview': 'Overview',
        '/ri/districts': 'Districts',
        '/ri/coordinators': 'Foundation Coordinators',
      }}
      fallbackTitle="RI Director Office"
      chip="RI" name="RI Director Office" role="Administrator"
      crumbs={[{ label: 'RI Director' }]}
    />
  )
}

export function ZoneLayout() {
  // The Zone Coordinator role is one ARRFC signed in, not the zone office.
  const me = signedInCoordinator()
  const nav = [
    { to: '/zone/coordinators', label: 'My Districts' },
    { to: '/zone/districts', label: 'All Districts' },
    { to: '/zone/goals', label: 'Goals' },
    { to: '/zone/foundation', label: 'Foundation Grid' },
    { to: '/zone/monthly-report', label: 'Monthly Report' },
  ]
  return (
    <Shell
      nav={nav}
      titles={{
        '/zone/coordinators': 'My Districts',
        '/zone/districts': 'All Districts',
        '/zone/goals': 'Goals — Zone Targets',
        '/zone/foundation': 'Foundation Goals Grid',
        '/zone/monthly-report': 'Monthly Coordinator Report',
      }}
      fallbackTitle={me.name}
      chip={initials(me.name.replace(/^PDG\s+Rtn\.?\s*(Dr\.?)?\s*/i, ''))}
      name={me.name}
      role={`ARRFC · D${me.supports.join(' D')}`}
      crumbs={[{ label: 'RI Director', to: '/ri/overview' }, { label: ZONE.name }, { label: me.name }]}
    />
  )
}

export function DistrictLayout() {
  const { districtId } = useParams()
  // Look the district up in the Zone 5 & 6 data, so all 23 work rather than the earlier nine.
  const d = DISHA_DISTRICTS.find((x) => x.number === String(districtId))
  if (!d) return <Navigate to="/ri/districts" replace />

  const zone = DISHA_ZONES.find((z) => z.id === d.zoneId)
  const nav = [
    { to: `/district/${districtId}/overview`, label: 'Overview' },
    { to: `/district/${districtId}/clubs`, label: 'Clubs' },
    { to: `/district/${districtId}/goals`, label: 'Goals' },
  ]
  return (
    <Shell
      nav={nav}
      titles={{
        [`/district/${districtId}/overview`]: `District ${districtId} Overview`,
        [`/district/${districtId}/clubs`]: `Clubs — District ${districtId}`,
        [`/district/${districtId}/goals`]: `Goals — District ${districtId}`,
      }}
      fallbackTitle={`District ${districtId}`}
      chip="DG" name={`District ${districtId}`} role={d.governor ?? 'DG Office'}
      crumbs={[
        { label: 'RI Director', to: '/ri/overview' },
        { label: zone?.name ?? 'Zone', to: '/ri/districts' },
        { label: `District ${districtId}` },
      ]}
    />
  )
}

export function ClubLayout() {
  const { clubId } = useParams()
  const club = CLUBS.find((c) => c.id === clubId)
  if (!club) return <Navigate to="/zone/districts" replace />

  const nav = [
    { to: `/club/${clubId}/overview`, label: 'Overview' },
    { to: `/club/${clubId}/goals`, label: 'Goals' },
  ]
  return (
    <Shell
      nav={nav}
      titles={{
        [`/club/${clubId}/overview`]: club.name,
        [`/club/${clubId}/goals`]: `Goals — ${club.name}`,
      }}
      fallbackTitle={club.name}
      chip={initials(club.name)} name={club.name} role="Club President"
      crumbs={[
        { label: 'RI Director', to: '/ri/overview' },
        { label: ZONE.name, to: '/zone/overview' },
        { label: `District ${club.districtId}`, to: `/district/${club.districtId}/overview` },
        { label: club.name },
      ]}
    />
  )
}
