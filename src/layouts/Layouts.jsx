import { useParams, Navigate } from 'react-router-dom'
import Shell from '@/components/Shell'
import { ZONE, getDistrict } from '@/data/zone6'
import { CLUBS } from '@/data/clubs'
import { initials } from '@/lib/format'

export function RiLayout() {
  const nav = [
    { to: '/ri/overview', label: 'Overview' },
    { to: '/ri/zones', label: 'Zones' },
    { to: '/ri/goals', label: 'Goals' },
  ]
  return (
    <Shell
      nav={nav}
      titles={{ '/ri/overview': 'Global Overview', '/ri/zones': 'Zones', '/ri/goals': 'Goals' }}
      fallbackTitle="RI Director Office"
      chip="RI" name="RI Director Office" role="Director-elect"
      crumbs={[{ label: 'RI Director' }]}
    />
  )
}

export function ZoneLayout() {
  const nav = [
    { to: '/zone/overview', label: 'Overview' },
    { to: '/zone/coordinators', label: 'Coordinators' },
    { to: '/zone/districts', label: 'Districts' },
    { to: '/zone/goals', label: 'Goals' },
    { to: '/zone/foundation', label: 'Foundation Grid' },
    { to: '/zone/monthly-report', label: 'Monthly Report' },
  ]
  return (
    <Shell
      nav={nav}
      titles={{
        '/zone/overview': 'Zone 6 Overview',
        '/zone/coordinators': 'Foundation Coordinators',
        '/zone/districts': 'Districts',
        '/zone/goals': 'Goals — Zone Targets',
        '/zone/foundation': 'Foundation Goals Grid',
        '/zone/monthly-report': 'Monthly Coordinator Report',
      }}
      fallbackTitle="Zone 6"
      chip="Z6" name={ZONE.name} role={`RRFC ${ZONE.rrfc.name}`}
      crumbs={[{ label: 'RI Director', to: '/ri/overview' }, { label: ZONE.name }]}
    />
  )
}

export function DistrictLayout() {
  const { districtId } = useParams()
  const d = getDistrict(districtId)
  if (!d) return <Navigate to="/zone/districts" replace />

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
      chip="DG" name={`District ${districtId}`} role="DG / DRFC Office"
      crumbs={[
        { label: 'RI Director', to: '/ri/overview' },
        { label: ZONE.name, to: '/zone/overview' },
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
