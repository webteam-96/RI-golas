// Zone 6 hierarchy: RI Director -> Zone -> District -> Club.
// There is deliberately no Assistant Governor level.

export const RY = '2026-27'
// Pace-based goal status (lib/rollup.js) reads this as months into the Rotary Year. It only
// drives the legacy Zone-role pages; the report views measure against a target, not a pace.
export const MONTHS_ELAPSED = 9
export const DATA_AS_OF = 'March 2026'

// Region labels are placeholders for orientation only — confirm against the RI directory
// before this is shown outside the room.
export const DISTRICTS = [
  { id: '3030', region: 'Maharashtra (Nagpur belt)',  governor: null },
  { id: '3100', region: 'Uttar Pradesh (west)',       governor: null },
  { id: '3110', region: 'Uttar Pradesh (central)',    governor: null },
  { id: '3120', region: 'Uttar Pradesh (Agra belt)',  governor: null },
  { id: '3240', region: 'North East & Sikkim',        governor: null },
  { id: '3250', region: 'Bihar & Jharkhand',          governor: null },
  { id: '3261', region: 'Chhattisgarh',               governor: null },
  { id: '3262', region: 'Odisha',                     governor: null },
  { id: '3292', region: 'Nepal & Bhutan',             governor: null },
]

export const ZONE = {
  id: 'zone-6',
  number: 6,
  name: 'Zone 6',
  riDirector: null,
  districtIds: DISTRICTS.map((d) => d.id),

  // The RRFC leads the whole zone. Each ARRFC supports one or two districts.
  //
  // NOTE: this map is many-to-many — D3120 is the RRFC's home district AND is supported by
  // ARRFC Jhunjhunuwala. Zone totals therefore sum DISTRICTS directly, never through this
  // list, or 3120 is counted twice. See lib/rollup.js and the assertion in lib/rollup.test.js.
  rrfc: {
    id: 'rrfc-1',
    name: 'Rtn Pramod Kumar',
    role: 'RRFC',
    roleLong: 'Regional Rotary Foundation Coordinator',
    homeDistrict: '3120',
    supports: DISTRICTS.map((d) => d.id), // zone-wide
  },
  coordinators: [
    { id: 'arrfc-1', name: 'PDG Rtn Dr Anand Ashok Jhunjhunuwala', role: 'ARRFC', homeDistrict: '3030', supports: ['3030', '3120'] },
    { id: 'arrfc-2', name: 'PDG Rtn Pawan Agarwal',                role: 'ARRFC', homeDistrict: '3110', supports: ['3110', '3100'] },
    { id: 'arrfc-3', name: 'PDG Rtn Dr Mohan Shyam Konwar',        role: 'ARRFC', homeDistrict: '3240', supports: ['3240'] },
    { id: 'arrfc-4', name: 'PDG Rtn Shashi Varvandkar',            role: 'ARRFC', homeDistrict: '3261', supports: ['3261', '3262'] },
    { id: 'arrfc-5', name: 'MN JHA',                               role: 'ARRFC', homeDistrict: '3292', supports: ['3292', '3250'] },
  ],
}

export const ARRFC_ROLE_LONG = 'Assistant Regional Rotary Foundation Coordinator'

/**
 * Who the Zone Coordinator role signs in as. That role is one ARRFC, not the whole team —
 * they see their own districts and nobody else's. The RI Director is the one who sees
 * everyone. Change this id to demo a different coordinator.
 */
export const SIGNED_IN_ARRFC = 'arrfc-1'

export const signedInCoordinator = () =>
  ZONE.coordinators.find((c) => c.id === SIGNED_IN_ARRFC) ?? ZONE.coordinators[0]

export const getDistrict = (id) => DISTRICTS.find((d) => d.id === id) ?? null

export const coordinatorsForDistrict = (districtId) =>
  ZONE.coordinators.filter((c) => c.supports.includes(districtId))
