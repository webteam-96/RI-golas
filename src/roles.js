import { ZONE, signedInCoordinator } from '@/data/zone6'

// The four levels. No Assistant Governor — the AG dashboard is a separate product surface
// and is deliberately not part of this hierarchy.
export const ROLES = [
  { id: 'ri',       label: 'RI Director',       sub: 'Administrator · all zones', chip: 'RI', home: '/ri/overview' },
  { id: 'zone',     label: 'Zone Coordinator',  sub: `ARRFC · ${signedInCoordinator().name}`, chip: 'AC', home: '/zone/coordinators' },
  { id: 'district', label: 'District Governor', sub: 'District 3120',             chip: 'DG', home: '/district/3120/overview' },
  { id: 'club',     label: 'Club President',    sub: 'Rotary Club of Thane',      chip: 'TH', home: '/club/15766/overview' },
]

export const roleForPath = (pathname) =>
  pathname.startsWith('/ri') || pathname.startsWith('/admin') ? 'ri' :
  pathname.startsWith('/zone') ? 'zone' :
  pathname.startsWith('/district') ? 'district' :
  pathname.startsWith('/club') ? 'club' : 'ri'
