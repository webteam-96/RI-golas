// AUTO-GENERATED from the DISHA Zone 4 & 7 portal seed data — do not edit by hand.
// Source: E:/Kalpesh/project/disha-goals/database/*.sql
//
// 2 zones · 21 districts · 3 categories · 40 fields.
// GOALS holds the 2026-27 targets, PREVIOUS holds the 2025-26 reference figures.
// Both are keyed districtId -> fieldId -> value, and a missing key means the cell was
// blank in the source. Blank is not zero and must render as a dash.

export const DISHA_ZONES = [
  {
    "id": 1,
    "name": "Zone 4"
  },
  {
    "id": 2,
    "name": "Zone 7"
  }
]

export const DISHA_DISTRICTS = [
  {
    "id": 1,
    "zoneId": 1,
    "number": "3011",
    "governor": "TBD - DG 3011"
  },
  {
    "id": 2,
    "zoneId": 1,
    "number": "3012",
    "governor": "TBD - DG 3012"
  },
  {
    "id": 3,
    "zoneId": 1,
    "number": "3040",
    "governor": "TBD - DG 3040"
  },
  {
    "id": 4,
    "zoneId": 1,
    "number": "3053",
    "governor": "TBD - DG 3053"
  },
  {
    "id": 5,
    "zoneId": 1,
    "number": "3055",
    "governor": "TBD - DG 3055"
  },
  {
    "id": 6,
    "zoneId": 1,
    "number": "3056",
    "governor": "TBD - DG 3056"
  },
  {
    "id": 7,
    "zoneId": 1,
    "number": "3060",
    "governor": "TBD - DG 3060"
  },
  {
    "id": 8,
    "zoneId": 1,
    "number": "3080",
    "governor": "TBD - DG 3080"
  },
  {
    "id": 9,
    "zoneId": 1,
    "number": "3090",
    "governor": "TBD - DG 3090"
  },
  {
    "id": 10,
    "zoneId": 1,
    "number": "3141",
    "governor": "TBD - DG 3141"
  },
  {
    "id": 11,
    "zoneId": 1,
    "number": "3142",
    "governor": "TBD - DG 3142"
  },
  {
    "id": 12,
    "zoneId": 2,
    "number": "3020",
    "governor": "TBD - DG 3020"
  },
  {
    "id": 13,
    "zoneId": 2,
    "number": "3131",
    "governor": "TBD - DG 3131"
  },
  {
    "id": 14,
    "zoneId": 2,
    "number": "3132",
    "governor": "TBD - DG 3132"
  },
  {
    "id": 15,
    "zoneId": 2,
    "number": "3150",
    "governor": "TBD - DG 3150"
  },
  {
    "id": 16,
    "zoneId": 2,
    "number": "3160",
    "governor": "TBD - DG 3160"
  },
  {
    "id": 17,
    "zoneId": 2,
    "number": "3170",
    "governor": "TBD - DG 3170"
  },
  {
    "id": 18,
    "zoneId": 2,
    "number": "3181",
    "governor": "TBD - DG 3181"
  },
  {
    "id": 19,
    "zoneId": 2,
    "number": "3182",
    "governor": "Rtn. B.M. Bhat"
  },
  {
    "id": 20,
    "zoneId": 2,
    "number": "3191",
    "governor": "TBD - DG 3191"
  },
  {
    "id": 21,
    "zoneId": 2,
    "number": "3192",
    "governor": "TBD - DG 3192"
  }
]

export const DISHA_CATEGORIES = [
  {
    "id": 1,
    "name": "Membership",
    "order": 1
  },
  {
    "id": 2,
    "name": "TRF",
    "order": 2
  },
  {
    "id": 3,
    "name": "Public Image",
    "order": 3
  }
]

export const DISHA_FIELDS = [
  {
    "id": 1,
    "categoryId": 1,
    "section": "Membership Targets",
    "name": "no_of_clubs",
    "label": "No of Clubs",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 1
  },
  {
    "id": 2,
    "categoryId": 1,
    "section": "Membership Targets",
    "name": "no_of_members",
    "label": "No of Members",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 2
  },
  {
    "id": 3,
    "categoryId": 1,
    "section": "Membership Targets",
    "name": "avg_member_per_club",
    "label": "Avg Member per Club",
    "dataType": "decimal",
    "readonly": true,
    "isTarget": false,
    "showPrev": true,
    "unit": "nos",
    "order": 3
  },
  {
    "id": 4,
    "categoryId": 1,
    "section": "Membership Targets",
    "name": "net_growth_of_clubs",
    "label": "Net Growth of Clubs",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 4
  },
  {
    "id": 5,
    "categoryId": 1,
    "section": "Club Size Distribution",
    "name": "red_less_than_20",
    "label": "Red - Less than 20",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "clubs",
    "order": 5
  },
  {
    "id": 6,
    "categoryId": 1,
    "section": "Club Size Distribution",
    "name": "amber_20_to_40",
    "label": "Amber - 20 to 40",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "clubs",
    "order": 6
  },
  {
    "id": 7,
    "categoryId": 1,
    "section": "Club Size Distribution",
    "name": "green_40_to_70",
    "label": "Green - 40 to 70",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "clubs",
    "order": 7
  },
  {
    "id": 8,
    "categoryId": 1,
    "section": "Club Size Distribution",
    "name": "dark_green_70_above",
    "label": "Dark Green - 70 and above",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "clubs",
    "order": 8
  },
  {
    "id": 9,
    "categoryId": 1,
    "section": "Diversity & Retention",
    "name": "women_member",
    "label": "Women Member",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 9
  },
  {
    "id": 10,
    "categoryId": 1,
    "section": "Diversity & Retention",
    "name": "women_members_pct",
    "label": "Women Members %",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "%",
    "order": 10
  },
  {
    "id": 11,
    "categoryId": 1,
    "section": "Diversity & Retention",
    "name": "membership_under_40",
    "label": "Current Membership < 40 years",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "%",
    "order": 11
  },
  {
    "id": 12,
    "categoryId": 1,
    "section": "Diversity & Retention",
    "name": "retention_rate",
    "label": "Retention Rate of 1 Year (1 July 2025)",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "%",
    "order": 12
  },
  {
    "id": 13,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "phf_target",
    "label": "PHF (Paul Harris Fellow)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 1
  },
  {
    "id": 14,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "phsm_target",
    "label": "PHSM (Paul Harris Society Member)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 2
  },
  {
    "id": 15,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "annual_fund_target",
    "label": "Annual Fund",
    "dataType": "currency_usd",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "$",
    "order": 3
  },
  {
    "id": 16,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "polioplus_target",
    "label": "PolioPlus",
    "dataType": "currency_usd",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "$",
    "order": 4
  },
  {
    "id": 17,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "endowment_fund_target",
    "label": "Endowment Fund",
    "dataType": "currency_usd",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "$",
    "order": 5
  },
  {
    "id": 18,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "major_gifts_target",
    "label": "Major Gifts",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 6
  },
  {
    "id": 19,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "aks_target",
    "label": "AKS (Arch Klumph Society)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "nos",
    "order": 7
  },
  {
    "id": 20,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "csr_target",
    "label": "CSR",
    "dataType": "currency_usd",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "$",
    "order": 8
  },
  {
    "id": 21,
    "categoryId": 2,
    "section": "TRF Targets",
    "name": "total_contributions_target",
    "label": "Total Contributions",
    "dataType": "currency_usd",
    "readonly": false,
    "isTarget": true,
    "showPrev": true,
    "unit": "$",
    "order": 9
  },
  {
    "id": 22,
    "categoryId": 2,
    "section": "Special Remarks",
    "name": "trf_special_remarks",
    "label": "Special Remarks / Commitments",
    "dataType": "text",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "-",
    "order": 10
  },
  {
    "id": 23,
    "categoryId": 3,
    "section": "Awareness & Training",
    "name": "district_pi_seminar",
    "label": "District Public Image Seminar (250 pts)",
    "dataType": "boolean",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "YES/NO",
    "order": 1
  },
  {
    "id": 24,
    "categoryId": 3,
    "section": "Awareness & Training",
    "name": "learning_sessions_count",
    "label": "Learning Sessions for Clubs/DLA/PELS (100 pts each)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "nos",
    "order": 2
  },
  {
    "id": 25,
    "categoryId": 3,
    "section": "Digital Media",
    "name": "social_media_district",
    "label": "District Facebook/Instagram min 5 posts/month (500 pts)",
    "dataType": "boolean",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "YES/NO",
    "order": 3
  },
  {
    "id": 26,
    "categoryId": 3,
    "section": "Digital Media",
    "name": "social_media_clubs_pct",
    "label": "% Clubs with Social Media (200 pts if >=33%)",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "%",
    "order": 4
  },
  {
    "id": 27,
    "categoryId": 3,
    "section": "Digital Media",
    "name": "brand_website_district",
    "label": "Brand Compliant District Website (500 pts)",
    "dataType": "boolean",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "YES/NO",
    "order": 5
  },
  {
    "id": 28,
    "categoryId": 3,
    "section": "Digital Media",
    "name": "brand_website_clubs_pct",
    "label": "% Clubs with Website (200 pts if >=33%)",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "%",
    "order": 6
  },
  {
    "id": 29,
    "categoryId": 3,
    "section": "Digital Media",
    "name": "electronic_media_district",
    "label": "Radio/TV/Electronic Media min 5 posts (500 pts)",
    "dataType": "boolean",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "YES/NO",
    "order": 7
  },
  {
    "id": 30,
    "categoryId": 3,
    "section": "Digital Media",
    "name": "electronic_media_clubs_pct",
    "label": "% Clubs with Electronic Media (200 pts if >=33%)",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "%",
    "order": 8
  },
  {
    "id": 31,
    "categoryId": 3,
    "section": "Projects",
    "name": "pi_projects_count",
    "label": "No of PI Projects (100pts x <=5, 200pts x 6-10, 300pts x 11+)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "nos",
    "order": 9
  },
  {
    "id": 32,
    "categoryId": 3,
    "section": "Display",
    "name": "display_items_count",
    "label": "Display Items Hoardings/Airport/Station/Walls (100pts x <=5, 200pts x 6+)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "nos",
    "order": 10
  },
  {
    "id": 33,
    "categoryId": 3,
    "section": "Print Media",
    "name": "bulletin_monthly_district",
    "label": "Monthly Bulletin District (500 pts)",
    "dataType": "boolean",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "YES/NO",
    "order": 11
  },
  {
    "id": 34,
    "categoryId": 3,
    "section": "Print Media",
    "name": "bulletin_clubs_pct",
    "label": "% Clubs with Monthly Bulletin (200 pts if >=33%)",
    "dataType": "percentage",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "%",
    "order": 12
  },
  {
    "id": 35,
    "categoryId": 3,
    "section": "Print Media",
    "name": "print_media_coverage_count",
    "label": "Print Media Coverage Count (100 pts each)",
    "dataType": "integer",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "nos",
    "order": 13
  },
  {
    "id": 36,
    "categoryId": 3,
    "section": "Computed",
    "name": "total_pi_points",
    "label": "Total Public Image Points",
    "dataType": "integer",
    "readonly": true,
    "isTarget": false,
    "showPrev": false,
    "unit": "pts",
    "order": 14
  },
  {
    "id": 37,
    "categoryId": 3,
    "section": "Reporting",
    "name": "monthly_report_commitment",
    "label": "Will file Monthly Report by 15th",
    "dataType": "boolean",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "YES/NO",
    "order": 15
  },
  {
    "id": 38,
    "categoryId": 3,
    "section": "Suggestions",
    "name": "pi_suggestion_1",
    "label": "Additional PI Activities Suggestion 1",
    "dataType": "text",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "-",
    "order": 16
  },
  {
    "id": 39,
    "categoryId": 3,
    "section": "Suggestions",
    "name": "pi_suggestion_2",
    "label": "Additional PI Activities Suggestion 2",
    "dataType": "text",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "-",
    "order": 17
  },
  {
    "id": 40,
    "categoryId": 3,
    "section": "Suggestions",
    "name": "pi_suggestion_3",
    "label": "Additional PI Activities Suggestion 3",
    "dataType": "text",
    "readonly": false,
    "isTarget": true,
    "showPrev": false,
    "unit": "-",
    "order": 18
  }
]

/** 2026-27 targets. districtId -> fieldId -> value */
export const GOALS = {
  "1": {
    "1": "150",
    "2": "5700",
    "3": "42",
    "4": "12",
    "5": "35",
    "6": "55",
    "7": "40",
    "8": "20",
    "9": "1820",
    "10": "31.93",
    "13": "300",
    "14": "110",
    "15": "260000",
    "16": "50000",
    "17": "150000",
    "18": "50",
    "19": "4",
    "20": "1500000",
    "21": "2100000"
  },
  "2": {
    "1": "150",
    "2": "4600",
    "3": "30.67",
    "4": "6",
    "5": "50",
    "6": "56",
    "7": "35",
    "8": "9",
    "13": "250",
    "14": "25",
    "15": "150000",
    "16": "15000",
    "17": "100000",
    "18": "15",
    "20": "1000000",
    "21": "1500000"
  },
  "3": {
    "1": "108",
    "2": "2500",
    "3": "23",
    "4": "6",
    "13": "115",
    "14": "10",
    "15": "37500",
    "16": "2500",
    "17": "25000",
    "18": "4",
    "19": "0",
    "20": "100000",
    "21": "275000"
  },
  "4": {
    "1": "77",
    "2": "3800",
    "15": "150000",
    "16": "10000",
    "17": "50000",
    "20": "90000",
    "21": "300000"
  },
  "5": {
    "1": "110",
    "2": "4400",
    "3": "40",
    "4": "11",
    "5": "40",
    "6": "33",
    "7": "25",
    "8": "12",
    "9": "530",
    "10": "12.05",
    "11": "19",
    "13": "400",
    "14": "25",
    "15": "190000",
    "16": "10000",
    "17": "100000",
    "18": "4",
    "19": "2",
    "20": "100000",
    "21": "540000"
  },
  "6": {
    "1": "100",
    "2": "4300",
    "3": "43",
    "4": "11",
    "5": "37",
    "6": "32",
    "7": "16",
    "8": "15",
    "9": "1075",
    "10": "25",
    "13": "50",
    "14": "2",
    "15": "50000",
    "16": "5000",
    "17": "50000",
    "18": "2",
    "19": "1",
    "20": "150000",
    "21": "255000"
  },
  "7": {
    "1": "106",
    "2": "5700",
    "3": "51",
    "4": "5",
    "5": "12",
    "6": "43",
    "7": "29",
    "8": "22",
    "9": "855",
    "10": "15",
    "11": "20",
    "12": "90",
    "13": "325",
    "14": "40",
    "15": "400000",
    "16": "6000",
    "17": "120000",
    "18": "20",
    "19": "1",
    "20": "125000",
    "21": "1200000"
  },
  "8": {
    "1": "135",
    "2": "5000",
    "3": "45",
    "4": "10",
    "5": "30",
    "6": "60",
    "7": "30",
    "8": "15",
    "9": "1200",
    "10": "24",
    "13": "500",
    "14": "50",
    "15": "500000",
    "16": "200000",
    "17": "300000",
    "18": "7",
    "19": "3",
    "20": "500000",
    "21": "1500000"
  },
  "9": {
    "2": "3600",
    "4": "25",
    "9": "300",
    "13": "350",
    "14": "2",
    "15": "110000",
    "16": "3000",
    "17": "25000",
    "18": "6",
    "19": "1",
    "20": "362000",
    "21": "500000"
  },
  "10": {
    "1": "129",
    "2": "7300",
    "3": "56.59",
    "4": "10",
    "5": "10",
    "6": "30",
    "7": "50",
    "8": "39",
    "9": "2263",
    "10": "31",
    "11": "10",
    "12": "91",
    "13": "1000",
    "14": "35",
    "15": "1150000",
    "16": "95000",
    "17": "525000",
    "18": "100",
    "19": "5",
    "20": "2500000",
    "21": "7000000"
  },
  "11": {
    "1": "112",
    "2": "3950",
    "3": "36",
    "4": "4",
    "12": "85",
    "14": "20",
    "15": "450000",
    "16": "50000",
    "17": "50000",
    "20": "450000",
    "21": "1000000"
  },
  "12": {
    "1": "90",
    "2": "4500",
    "3": "50",
    "4": "11",
    "5": "0",
    "6": "61",
    "7": "10",
    "8": "19",
    "9": "550",
    "10": "12.22",
    "13": "500",
    "14": "30",
    "15": "350000",
    "16": "200000",
    "17": "150000",
    "18": "20",
    "19": "2",
    "20": "300000",
    "21": "1000000"
  },
  "13": {
    "1": "138",
    "2": "5520",
    "3": "40",
    "4": "3",
    "5": "23",
    "6": "52",
    "7": "53",
    "8": "7",
    "9": "2100",
    "10": "38.04",
    "11": "9",
    "13": "400",
    "14": "50",
    "15": "955000",
    "16": "20000",
    "17": "100000",
    "18": "25",
    "19": "2",
    "20": "1000000",
    "21": "3150000"
  },
  "14": {
    "1": "115",
    "2": "5000",
    "3": "500",
    "4": "5",
    "5": "30",
    "6": "30",
    "7": "40",
    "8": "15",
    "9": "800",
    "10": "16",
    "11": "20",
    "12": "64",
    "13": "335",
    "14": "75",
    "15": "350000",
    "16": "15000",
    "17": "125000",
    "18": "80000",
    "19": "2",
    "20": "233333",
    "21": "803333"
  },
  "15": {
    "1": "115",
    "2": "5000",
    "3": "43",
    "4": "10",
    "5": "10",
    "6": "55",
    "7": "30",
    "8": "10",
    "9": "650",
    "10": "13",
    "11": "15",
    "12": "85",
    "13": "200",
    "14": "150",
    "15": "300000",
    "16": "50000",
    "17": "300000",
    "18": "10",
    "19": "1",
    "20": "2350000",
    "21": "3000000"
  },
  "16": {
    "1": "80",
    "2": "2500",
    "3": "35",
    "4": "2",
    "13": "100",
    "14": "1",
    "15": "200000",
    "16": "20000",
    "17": "60000",
    "18": "5",
    "19": "0",
    "20": "0",
    "21": "200000"
  },
  "17": {
    "1": "155",
    "2": "7500",
    "3": "50",
    "4": "12",
    "5": "12",
    "6": "70",
    "7": "51",
    "8": "21",
    "9": "1291",
    "10": "20",
    "11": "17.5",
    "12": "90",
    "13": "700",
    "14": "20",
    "15": "650000",
    "16": "110000",
    "17": "50000",
    "18": "30",
    "19": "1",
    "20": "500000",
    "21": "2100000"
  },
  "18": {
    "1": "100",
    "2": "4750",
    "3": "40",
    "4": "10",
    "9": "600",
    "10": "12.63",
    "13": "200",
    "14": "75",
    "15": "400000",
    "16": "20000",
    "17": "10000",
    "18": "5",
    "19": "1",
    "20": "10000",
    "21": "440000"
  },
  "19": {
    "1": "100",
    "2": "5000",
    "3": "45",
    "4": "12",
    "5": "17",
    "6": "40",
    "7": "36",
    "8": "7",
    "9": "500",
    "10": "10",
    "13": "50",
    "14": "25",
    "15": "300000",
    "16": "50000",
    "17": "50000",
    "18": "0",
    "19": "0",
    "20": "3",
    "21": "500000"
  },
  "20": {
    "1": "100",
    "2": "3800",
    "3": "38",
    "4": "7",
    "5": "0",
    "6": "60",
    "7": "30",
    "8": "10",
    "9": "815",
    "10": "21.5",
    "11": "13",
    "12": "83",
    "13": "75",
    "14": "30",
    "15": "170000",
    "16": "20000",
    "17": "65000",
    "18": "20",
    "19": "2",
    "20": "550000",
    "21": "1100000"
  },
  "21": {
    "1": "115",
    "2": "5000",
    "3": "46",
    "4": "15",
    "13": "100000",
    "15": "300000",
    "16": "200000",
    "17": "1000000",
    "18": "500000",
    "20": "4000000",
    "21": "6100000"
  }
}

/** 2025-26 reference figures. districtId -> fieldId -> value */
export const PREVIOUS = {
  "1": {
    "1": "134",
    "2": "4982",
    "15": "221245",
    "16": "26050",
    "17": "72607",
    "20": "742933",
    "21": "1736284"
  },
  "2": {
    "1": "158",
    "2": "3758",
    "15": "129887",
    "16": "6581",
    "17": "39732",
    "20": "304848",
    "21": "744215"
  },
  "3": {
    "1": "101",
    "2": "2342",
    "15": "37980",
    "16": "1881",
    "17": "4711",
    "20": "47405",
    "21": "197575"
  },
  "4": {
    "1": "75",
    "2": "3312",
    "15": "123227",
    "16": "4597",
    "17": "16198",
    "20": "107334",
    "21": "328113"
  },
  "5": {
    "1": "90",
    "2": "3344",
    "15": "79259",
    "16": "23241",
    "17": "30164",
    "20": "0",
    "21": "115133"
  },
  "6": {
    "1": "85",
    "2": "3958",
    "15": "57087",
    "16": "3868",
    "17": "13862",
    "20": "0",
    "21": "63578"
  },
  "7": {
    "1": "102",
    "2": "4797",
    "15": "389044",
    "16": "9637",
    "17": "116964",
    "20": "129899",
    "21": "1189687"
  },
  "8": {
    "1": "120",
    "2": "4152",
    "15": "135340",
    "16": "17314",
    "17": "33893",
    "20": "25748",
    "21": "274274"
  },
  "9": {
    "1": "129",
    "2": "2289",
    "15": "73877",
    "16": "1195",
    "17": "17063",
    "20": "45030",
    "21": "148705"
  },
  "10": {
    "1": "122",
    "2": "6307",
    "15": "902506",
    "16": "62633",
    "17": "302978",
    "20": "1361057",
    "21": "4186496"
  },
  "11": {
    "1": "113",
    "2": "3767",
    "15": "501160",
    "16": "60165",
    "17": "50518",
    "20": "253713",
    "21": "982048"
  },
  "12": {
    "1": "81",
    "2": "4253",
    "15": "168643",
    "16": "138662",
    "17": "148352",
    "20": "99570",
    "21": "634386"
  },
  "13": {
    "1": "137",
    "2": "4914",
    "15": "747374",
    "16": "31329",
    "17": "166590",
    "20": "969830",
    "21": "2521514"
  },
  "14": {
    "1": "102",
    "2": "3844",
    "15": "147198",
    "16": "8289",
    "17": "25768",
    "20": "26069",
    "21": "242146"
  },
  "15": {
    "1": "99",
    "2": "3778",
    "15": "178296",
    "16": "34377",
    "17": "162222",
    "20": "235556",
    "21": "727641"
  },
  "16": {
    "1": "77",
    "2": "2390",
    "15": "139201",
    "16": "11759",
    "17": "27775",
    "20": "0",
    "21": "193703"
  },
  "17": {
    "1": "142",
    "2": "6217",
    "15": "462880",
    "16": "41558",
    "17": "101256",
    "20": "66694",
    "21": "1031727"
  },
  "18": {
    "1": "91",
    "2": "3547",
    "15": "251005",
    "16": "9237",
    "17": "9344",
    "20": "0",
    "21": "273742"
  },
  "19": {
    "1": "85",
    "2": "3692",
    "15": "123943",
    "16": "6796",
    "17": "6743",
    "20": "0",
    "21": "179889"
  },
  "20": {
    "1": "85",
    "2": "2918",
    "15": "198416",
    "16": "27570",
    "17": "196650",
    "20": "275730",
    "21": "940171"
  },
  "21": {
    "1": "85",
    "2": "3258",
    "15": "221094",
    "16": "29219",
    "17": "273491",
    "20": "150660",
    "21": "1062897"
  }
}

export const GOALS_YEAR = '2026-27'
export const PREVIOUS_YEAR = '2025-26'

export const fieldsIn = (categoryId) =>
  DISHA_FIELDS.filter((f) => f.categoryId === categoryId).sort((a, b) => a.order - b.order)

export const districtsIn = (zoneId) => DISHA_DISTRICTS.filter((d) => d.zoneId === zoneId)

export const goalValue = (districtId, fieldId) => GOALS[String(districtId)]?.[String(fieldId)] ?? null
export const prevValue = (districtId, fieldId) => PREVIOUS[String(districtId)]?.[String(fieldId)] ?? null
