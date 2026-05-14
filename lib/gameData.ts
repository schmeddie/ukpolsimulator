import { v4 as uuidv4 } from "uuid";
import { NPC, Party, Role, PolicyArea, NPCTrait, ScenarioCabinetMember } from "./store/types";

// ─── UK Constituencies (sample 80) ───────────────────────────────────────────

export const CONSTITUENCIES: string[] = [
  "Hackney North & Stoke Newington", "Leeds Central", "Birmingham Ladywood",
  "Manchester Central", "Bristol West", "Brighton Pavilion", "Edinburgh North & Leith",
  "Cardiff Central", "Sheffield Hallam", "Liverpool Riverside",
  "Islington North", "Tottenham", "Vauxhall", "Bermondsey & Old Southwark",
  "Greenwich & Woolwich", "Lewisham East", "Streatham", "Tooting",
  "Battersea", "Putney", "Richmond Park", "Wimbledon", "Sutton & Cheam",
  "Croydon Central", "Mitcham & Morden", "Dulwich & West Norwood",
  "Hammersmith", "Chelsea & Fulham", "Cities of London & Westminster",
  "Kensington", "Hampstead & Kilburn", "Holborn & St Pancras",
  "Poplar & Limehouse", "Bethnal Green & Bow", "West Ham", "East Ham",
  "Ilford North", "Chingford & Wood Green", "Hornsey & Wood Green",
  "Hendon", "Finchley & Golders Green", "Barnet", "Enfield Southgate",
  "Harrow East", "Uxbridge & Ruislip South", "Ealing Central",
  "Brentford & Isleworth", "Feltham & Heston", "Hayes & Harlington",
  "Slough", "Windsor", "Maidenhead", "Reading East", "Oxford East",
  "Oxford West & Abingdon", "Witney", "Banbury", "North Cotswolds",
  "Cheltenham", "Gloucester", "Stroud", "South Cotswolds",
  "Bath", "Weston-super-Mare", "Taunton", "Yeovil", "Exeter",
  "Plymouth Sutton", "Truro & Falmouth", "St Ives", "St Austell & Newquay",
  "Camborne & Redruth", "North Cornwall", "Torridge & Tavistock",
  "Totnes", "Tiverton & Honiton", "East Devon", "Honiton",
  "Bournemouth East", "Christchurch", "Poole", "Mid Dorset",
  "Dorchester", "Weymouth & Portland", "Winchester", "Eastleigh",
  "Southampton Test", "Southampton Itchen", "Portsmouth South",
  "Isle of Wight", "Aldershot", "Farnham", "Surrey Heath",
  "Reigate", "Crawley", "Horsham", "Arundel & South Downs",
  "Worthing West", "Hove", "Brighton Kemptown", "Lewes",
  "Eastbourne", "Hastings & Rye", "Bexhill & Battle",
  "Folkestone & Hythe", "Dover", "Canterbury", "Faversham & Mid Kent",
  "Maidstone & The Weald", "Tonbridge & Malling", "Sevenoaks",
  "Tunbridge Wells", "Chatham & Aylesford", "Rochester & Strood",
  "Sittingbourne & Sheppey", "Ramsgate", "North Thanet",
  "South Thanet", "Thirsk & Malton", "Scarborough & Whitby",
  "Beverley & Holderness", "Hull East", "Hull West & Hessle",
  "Kingston upon Hull North", "Haltemprice & Howden",
  "Brigg & Goole", "Scunthorpe", "Grimsby", "Louth & Horncastle",
  "Lincoln", "Grantham & Stamford", "Boston & Skegness",
  "South Holland & The Deepings", "Rutland & Melton",
  "Loughborough", "Leicester East", "Leicester South", "Leicester West",
  "Harborough", "Bosworth", "North West Leicestershire",
  "Hinckley & Bosworth", "Daventry", "Northampton South",
  "Corby", "Kettering", "Wellingborough", "Rushden", "Bedford",
  "Mid Bedfordshire", "North East Bedfordshire", "South West Bedfordshire",
  "Luton South", "Luton North", "Hitchin & Harpenden",
  "Welwyn Hatfield", "Hertford & Stortford", "Broxbourne",
  "North East Hertfordshire", "Stevenage", "Hemel Hempstead",
  "St Albans", "Watford", "South West Hertfordshire", "Hertsmere",
  "Colchester", "Chelmsford", "Brentwood & Ongar", "Basildon & Billericay",
  "Rayleigh & Wickford", "Rochford & Southend East", "Southend West",
  "Castle Point", "Thurrock", "Harlow", "Epping Forest", "Saffron Walden",
  "North Essex", "Clacton", "Maldon", "Braintree", "Witham",
  "Great Yarmouth", "Broadland", "Norwich North", "Norwich South",
  "Mid Norfolk", "South West Norfolk", "South Norfolk", "North Norfolk",
  "North West Norfolk", "Waveney", "Central Suffolk & North Ipswich",
  "Ipswich", "South Suffolk", "Suffolk Coastal", "Eye",
  "Cambridge", "South Cambridgeshire", "North East Cambridgeshire",
  "South East Cambridgeshire", "North West Cambridgeshire", "Huntingdon",
  "Peterborough", "North West Norfolk", "King's Lynn",
  "Watford", "Norwich South",
];

// ─── NPC Name Pool ────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James", "Sarah", "Michael", "Emma", "David", "Helen", "Andrew", "Karen",
  "Robert", "Lisa", "William", "Claire", "Richard", "Susan", "Thomas", "Patricia",
  "Charles", "Margaret", "George", "Elizabeth", "Edward", "Angela", "Henry",
  "Catherine", "Oliver", "Rachel", "Harry", "Victoria", "Jack", "Jennifer",
  "Priya", "Rishi", "Yvette", "Harriet", "Wes", "Jess", "Kemi", "Bim",
  "Sadiq", "Anas", "Keir", "Bridget", "Darren", "Penny", "Jeremy", "Liz",
  "Boris", "Jacob", "Rory", "Anna", "Nadia", "Fiona", "Alison", "Diane",
  "Stella", "Caroline", "Yvonne", "Rosie",
];

const LAST_NAMES = [
  "Smith", "Jones", "Williams", "Brown", "Davies", "Evans", "Wilson", "Taylor",
  "Thomas", "Roberts", "Johnson", "Lewis", "Walker", "Robinson", "Wood", "Thompson",
  "White", "Watson", "Jackson", "Wright", "Green", "Harris", "Cooper", "King",
  "Lee", "Martin", "Clarke", "Patel", "Khan", "Ahmed", "Ali", "Singh",
  "Sharma", "Gupta", "Rees-Mogg", "Farage", "Gove", "Hunt", "Sunak", "Truss",
  "Johnson", "Blair", "Starmer", "Reeves", "Cooper", "Streeting", "McFadden",
  "Ashworth", "Phillips", "Burden", "Flint", "Eagle", "Kendall", "Thornberry",
  "Abbott", "Lammy", "Miliband", "Balls", "Benn", "Harman", "Burnham",
];

const MINISTERIAL_ROLES: string[] = [
  "Chancellor of the Exchequer",
  "Home Secretary",
  "Foreign Secretary",
  "Secretary of State for Health",
  "Secretary of State for Education",
  "Secretary of State for Defence",
  "Secretary of State for Housing",
  "Secretary of State for Environment",
  "Secretary of State for Transport",
  "Secretary of State for Work and Pensions",
  "Attorney General",
  "Lord Chancellor",
  "Chief Secretary to the Treasury",
];

const PERSONALITIES = [
  "A cautious pragmatist who votes with the party but harbours private doubts",
  "A firebrand idealist who'd rather lose the whip than betray principles",
  "A calculating operator who builds alliances across party lines",
  "A media-hungry backbencher who courts controversy for column inches",
  "A loyalist who would walk off a cliff if the party leader asked",
  "A constituency champion who puts local interests above national politics",
  "An old-guard traditionalist suspicious of modernisation",
  "A tech-forward moderniser pushing digital government",
  "A soft-spoken intellectual whose Commons speeches are devastating",
  "A boisterous populist beloved in their seat but divisive nationally",
  "A former journalist who knows where all the bodies are buried",
  "A second-generation immigrant who sees politics as service",
  "A patrician grandee who believes governance is a duty not a career",
  "A union-backed MP who considers themselves the workers' tribune",
  "An ex-military figure who values chain of command above all",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStances(): Record<PolicyArea, number> {
  const areas: PolicyArea[] = [
    "Economy", "NHS", "Housing", "Education", "Defence",
    "Environment", "Immigration", "Crime", "Welfare", "Foreign Policy",
  ];
  const stances: Partial<Record<PolicyArea, number>> = {};
  for (const area of areas) {
    stances[area] = randomInt(-80, 80);
  }
  return stances as Record<PolicyArea, number>;
}

function randomTraits(): NPCTrait[] {
  const allTraits: NPCTrait[] = [
    "Loyal", "Ambitious", "Chaos Agent", "Principled", "Opportunist",
    "Idealist", "Pragmatist", "Backstabber", "Media Savvy", "Grassroots Hero",
  ];
  const count = randomInt(1, 3);
  const shuffled = [...allTraits].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Party Distribution for 50 NPCs ──────────────────────────────────────────

const PARTY_DISTRIBUTION: Array<{ party: Party; count: number }> = [
  { party: "Conservative", count: 16 },
  { party: "Labour", count: 16 },
  { party: "Liberal Democrat", count: 5 },
  { party: "SNP", count: 4 },
  { party: "Green", count: 3 },
  { party: "Reform UK", count: 4 },
  { party: "Independent", count: 2 },
];

export function generateInitialNPCs(
  playerParty: Party,
  cabinetFromScenario: ScenarioCabinetMember[] = []
): NPC[] {
  const npcs: NPC[] = [];

  // 1. Seed from AI-generated cabinet members first
  for (const cm of cabinetFromScenario) {
    const isCabinet = [
      "Prime Minister", "Chancellor", "Home Secretary", "Foreign Secretary",
      "Secretary of State", "Attorney General", "Lord Chancellor",
    ].some((title) => cm.role.startsWith(title));

    const roleMap: Record<string, Role> = {
      "Prime Minister": "Prime Minister",
      "Leader of the Opposition": "Leader of the Opposition",
    };
    const resolvedRole: Role = roleMap[cm.role] ??
      (isCabinet ? "Cabinet Minister" : "Shadow Cabinet");

    npcs.push({
      id: uuidv4(),
      name: cm.name,
      party: cm.party,
      role: resolvedRole,
      constituency: randomFrom(CONSTITUENCIES),
      traits: randomTraits(),
      stances: randomStances(),
      loyaltyToPlayer: cm.party === playerParty ? randomInt(15, 55) : randomInt(-50, 10),
      personalRelationship: randomInt(-15, 15),
      ministerialRole: isCabinet ? cm.role : undefined,
      isInCabinet: isCabinet,
      corruptionLevel: randomInt(0, 30),
      personalityDescription: cm.description || randomFrom(PERSONALITIES),
    });
  }

  // 2. Fill remaining 50 slots with random MPs
  const targetTotal = Math.max(50, cabinetFromScenario.length + 35);
  let ministerCount = cabinetFromScenario.filter((c) => c.role === "Cabinet Minister").length;

  for (const { party, count } of PARTY_DISTRIBUTION) {
    const alreadyAdded = npcs.filter((n) => n.party === party).length;
    const toAdd = Math.max(0, count - alreadyAdded);
    for (let i = 0; i < toAdd; i++) {
      const firstName = randomFrom(FIRST_NAMES);
      const lastName = randomFrom(LAST_NAMES);
      const roles: Role[] = party === playerParty
        ? ["Junior Minister", "Backbencher", "Parliamentary Private Secretary"]
        : party === (npcs.find((n) => n.role === "Leader of the Opposition")?.party ?? "Conservative")
        ? ["Shadow Cabinet", "Backbencher"]
        : ["Backbencher"];

      npcs.push({
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        party,
        role: randomFrom(roles),
        constituency: randomFrom(CONSTITUENCIES),
        traits: randomTraits(),
        stances: randomStances(),
        loyaltyToPlayer: party === playerParty ? randomInt(20, 60) : randomInt(-40, 20),
        personalRelationship: randomInt(-20, 20),
        ministerialRole: undefined,
        isInCabinet: false,
        corruptionLevel: randomInt(0, 40),
        personalityDescription: randomFrom(PERSONALITIES),
      });
    }
  }

  return npcs;
}

// ─── Constituencies by Region (for map picker) ───────────────────────────────

export const CONSTITUENCIES_BY_REGION: Record<string, string[]> = {
  "Scotland": [
    "Edinburgh North & Leith", "Edinburgh South", "Edinburgh East", "Edinburgh West",
    "Glasgow Central", "Glasgow East", "Glasgow North East", "Glasgow South West",
    "Aberdeen North", "Aberdeen South", "Dundee East", "Dundee West",
    "Inverness & Nairn", "Perth & North Perthshire", "Stirling",
    "Ayr, Carrick & Cumnock", "Kilmarnock & Loudoun", "Dumfries & Galloway",
    "Falkirk", "Livingston", "Motherwell & Wishaw",
  ],
  "Northern Ireland": [
    "Belfast East", "Belfast South", "Belfast North", "Belfast West",
    "Foyle (Derry)", "Newry & Armagh", "East Antrim", "North Antrim",
    "Strangford", "Upper Bann", "East Londonderry", "South Down",
  ],
  "North East England": [
    "Newcastle upon Tyne Central", "Newcastle upon Tyne East", "Newcastle upon Tyne North",
    "Sunderland Central", "Houghton & Sunderland South", "Washington & Gateshead South",
    "Middlesbrough", "Middlesbrough South & East Cleveland", "Stockton North",
    "Stockton South", "Durham North West", "City of Durham",
    "Hartlepool", "Hexham", "Berwick-upon-Tweed",
  ],
  "North West England": [
    "Manchester Central", "Manchester Gorton", "Manchester Withington",
    "Salford & Eccles", "Stretford & Urmston", "Wythenshawe & Sale East",
    "Liverpool Riverside", "Liverpool West Derby", "Liverpool Walton",
    "Liverpool Wavertree", "Birkenhead", "Wallasey",
    "Warrington North", "Warrington South",
    "Blackburn", "Blackpool South", "Preston", "Lancaster & Fleetwood",
    "Wigan", "Makerfield", "Bolton South East", "Bolton West",
    "Oldham West & Royton", "Rochdale", "Bury North", "Bury South",
    "Cheadle", "Hazel Grove", "Macclesfield", "Tatton",
  ],
  "Yorkshire & the Humber": [
    "Leeds Central", "Leeds East", "Leeds West", "Leeds North West",
    "Sheffield Hallam", "Sheffield Central", "Sheffield Brightside & Hillsborough",
    "Bradford East", "Bradford West", "Bradford South",
    "Huddersfield", "Halifax", "Dewsbury",
    "York Central", "York Outer",
    "Doncaster Central", "Barnsley East", "Rotherham",
    "Kingston upon Hull North", "Hull East", "Hull West & Hessle",
    "Beverley & Holderness", "Scarborough & Whitby",
    "Thirsk & Malton", "Skipton & Ripon",
  ],
  "East Midlands": [
    "Leicester East", "Leicester South", "Leicester West",
    "Loughborough", "Harborough", "Bosworth", "North West Leicestershire", "Hinckley & Bosworth",
    "Nottingham South", "Nottingham East", "Nottingham North",
    "Rushcliffe", "Broxtowe", "Gedling",
    "Derby North", "Derby South", "Erewash", "Mid Derbyshire",
    "Lincoln", "Grantham & Stamford", "Boston & Skegness",
    "South Holland & The Deepings", "Rutland & Melton",
    "Daventry", "Northampton South", "Northampton North",
    "Corby", "Kettering", "Wellingborough", "Rushden",
  ],
  "West Midlands": [
    "Birmingham Ladywood", "Birmingham Edgbaston", "Birmingham Selly Oak",
    "Birmingham Northfield", "Birmingham Hall Green", "Birmingham Perry Barr",
    "Birmingham Yardley", "Birmingham Erdington",
    "Coventry South", "Coventry North East", "Coventry North West",
    "Wolverhampton South East", "Wolverhampton South West", "Wolverhampton North East",
    "Walsall South", "Walsall North",
    "Stoke-on-Trent Central", "Stoke-on-Trent North", "Stoke-on-Trent South",
    "Hereford & South Herefordshire", "Worcester", "Redditch",
    "Shrewsbury & Atcham", "Telford", "Lichfield",
  ],
  "Wales": [
    "Cardiff Central", "Cardiff North", "Cardiff West", "Cardiff South & Penarth",
    "Swansea East", "Swansea West", "Neath",
    "Rhondda", "Pontypridd", "Caerphilly",
    "Newport East", "Newport West", "Torfaen",
    "Wrexham", "Clwyd South", "Clwyd West", "Vale of Clwyd",
    "Aberavon", "Bridgend", "Ogmore",
    "Ynys Môn (Anglesey)", "Arfon", "Dwyfor Meirionnydd",
    "Ceredigion", "Brecon & Radnorshire", "Montgomeryshire",
  ],
  "East of England": [
    "Cambridge", "South Cambridgeshire", "North East Cambridgeshire",
    "Huntingdon", "Peterborough",
    "Ipswich", "South Suffolk", "Suffolk Coastal", "Waveney",
    "Norwich South", "Norwich North", "Great Yarmouth",
    "Bedford", "Mid Bedfordshire", "Luton South", "Luton North",
    "Stevenage", "Welwyn Hatfield", "Hertford & Stortford", "St Albans",
    "Watford", "Hemel Hempstead", "Hitchin & Harpenden",
    "Colchester", "Chelmsford", "Basildon & Billericay",
    "Southend West", "Clacton", "Harlow", "Braintree",
    "Thurrock", "Castle Point", "Rayleigh & Wickford",
  ],
  "London": [
    "Hackney North & Stoke Newington", "Islington North", "Tottenham", "Hornsey & Wood Green",
    "Vauxhall", "Bermondsey & Old Southwark", "Greenwich & Woolwich",
    "Lewisham East", "Streatham", "Dulwich & West Norwood",
    "Tooting", "Mitcham & Morden", "Wimbledon",
    "Battersea", "Putney", "Richmond Park",
    "Hammersmith", "Chelsea & Fulham", "Kensington",
    "Cities of London & Westminster", "Holborn & St Pancras",
    "Hampstead & Kilburn", "Hendon", "Finchley & Golders Green", "Barnet",
    "Poplar & Limehouse", "Bethnal Green & Bow", "West Ham", "East Ham",
    "Ilford North", "Ilford South", "Chingford & Wood Green",
    "Enfield Southgate", "Enfield North",
    "Harrow East", "Harrow West", "Brent Central",
    "Uxbridge & Ruislip South", "Ealing Central", "Ealing North",
    "Brentford & Isleworth", "Feltham & Heston", "Hayes & Harlington",
    "Croydon Central", "Croydon North", "Croydon South",
    "Sutton & Cheam", "Carshalton & Wallington",
  ],
  "South East England": [
    "Brighton Pavilion", "Brighton Kemptown", "Hove", "Lewes",
    "Eastbourne", "Hastings & Rye", "Bexhill & Battle",
    "Canterbury", "Folkestone & Hythe", "Dover", "Thanet South", "North Thanet",
    "Maidstone & The Weald", "Tonbridge & Malling", "Tunbridge Wells",
    "Sevenoaks", "Faversham & Mid Kent", "Chatham & Aylesford",
    "Rochester & Strood", "Sittingbourne & Sheppey",
    "Horsham", "Arundel & South Downs", "Worthing West", "Crawley",
    "Reigate", "Surrey Heath", "Guildford", "Woking",
    "Winchester", "Eastleigh", "Southampton Test", "Southampton Itchen",
    "Portsmouth South", "Portsmouth North", "Isle of Wight",
    "Aldershot", "Farnham",
    "Slough", "Windsor", "Maidenhead", "Reading East", "Reading West",
    "Oxford East", "Oxford West & Abingdon", "Banbury", "Witney",
  ],
  "South West England": [
    "Bristol West", "Bristol South", "Bristol East", "Bristol North West",
    "Bath", "Weston-super-Mare", "Wells", "Somerton & Frome",
    "Taunton", "Bridgwater & West Somerset", "Yeovil",
    "Exeter", "East Devon", "Tiverton & Honiton",
    "Plymouth Sutton & Devonport", "Plymouth Moor View",
    "Totnes", "Torridge & Tavistock", "Newton Abbot",
    "Truro & Falmouth", "St Ives", "St Austell & Newquay",
    "Camborne & Redruth", "North Cornwall", "South East Cornwall",
    "Cheltenham", "Gloucester", "Stroud", "Forest of Dean",
    "North Cotswolds", "South Cotswolds",
    "Bournemouth East", "Bournemouth West", "Poole", "Christchurch",
    "Dorchester", "Weymouth & Portland", "Mid Dorset & North Poole",
  ],
};

// ─── Static Headlines Pool (for non-AI turns) ─────────────────────────────────

export const STATIC_HEADLINES: Array<{ headline: string; sentiment: "positive" | "negative" | "neutral" | "scandal"; source: string }> = [
  { headline: "Chancellor: 'We are turning a corner on inflation'", sentiment: "positive", source: "The Telegraph" },
  { headline: "NHS staff shortfall reaches 100,000 — unions demand action", sentiment: "negative", source: "The Mirror" },
  { headline: "House prices fall for fifth consecutive month", sentiment: "negative", source: "Financial Times" },
  { headline: "PM survives confidence vote by 18 — 'wounded but alive'", sentiment: "neutral", source: "BBC Politics" },
  { headline: "Minister faces calls to resign over leaked WhatsApp messages", sentiment: "scandal", source: "The Sunday Times" },
  { headline: "Energy giants post record profits — Labour demands windfall tax", sentiment: "negative", source: "The Guardian" },
  { headline: "New trade deal with India announced — 'historic moment'", sentiment: "positive", source: "Sky News" },
  { headline: "Tory rebels threaten to block Budget — 'not the manifesto we stood on'", sentiment: "negative", source: "The Spectator" },
  { headline: "Knife crime falls for first time in five years", sentiment: "positive", source: "Home Office" },
  { headline: "Schools face 'funding cliff edge' warn headteachers", sentiment: "negative", source: "TES" },
  { headline: "PMQs: Opposition lands blow over water company bonuses", sentiment: "negative", source: "PA Media" },
  { headline: "Local elections: warning signs for government in safe seats", sentiment: "negative", source: "Electoral Calculus" },
  { headline: "Former minister 'shocked' by Number 10 culture — new book", sentiment: "scandal", source: "The Times" },
  { headline: "New HS2 cost estimate: £67 billion and rising", sentiment: "negative", source: "The Independent" },
  { headline: "Polling surge: third party hits 18% in new survey", sentiment: "neutral", source: "Opinium" },
  { headline: "Welfare cuts 'will push 300,000 into poverty' — IFS", sentiment: "negative", source: "Institute for Fiscal Studies" },
  { headline: "Defence budget to rise to 2.5% of GDP — NATO allies praise move", sentiment: "positive", source: "MOD" },
  { headline: "Leaks suggest Cabinet split over net zero timeline", sentiment: "scandal", source: "The Times" },
  { headline: "Government wins key vote by majority of two", sentiment: "neutral", source: "Hansard Society" },
  { headline: "New IPCC report: UK must accelerate emissions cuts immediately", sentiment: "neutral", source: "BBC Environment" },
];

// ─── Policy Template Presets ──────────────────────────────────────────────────

export const POLICY_PRESETS = [
  {
    name: "NHS Emergency Funding Act",
    description: "Emergency capital injection into NHS trusts to reduce waiting lists",
    area: "NHS" as PolicyArea,
    parameters: [
      { key: "funding_bn", label: "Funding (£bn)", value: 5, min: 1, max: 20, unit: "£bn" },
      { key: "target_wait_weeks", label: "Target Wait (weeks)", value: 12, min: 4, max: 52, unit: "weeks" },
    ],
  },
  {
    name: "Build Britain Housing Bill",
    description: "Mandate new housing targets and release green belt land in commuter zones",
    area: "Housing" as PolicyArea,
    parameters: [
      { key: "homes_target", label: "Annual Homes Target", value: 300000, min: 100000, max: 500000, unit: "homes" },
      { key: "green_belt_pct", label: "Green Belt Released (%)", value: 5, min: 0, max: 20, unit: "%" },
    ],
  },
  {
    name: "Cost of Living Relief Package",
    description: "Direct payments to households below median income",
    area: "Welfare" as PolicyArea,
    parameters: [
      { key: "payment_gbp", label: "Household Payment", value: 500, min: 100, max: 2000, unit: "£" },
      { key: "income_threshold", label: "Income Threshold", value: 35000, min: 20000, max: 60000, unit: "£/yr" },
    ],
  },
  {
    name: "Digital Infrastructure Investment Act",
    description: "Public investment in nationwide gigabit broadband and 5G rollout",
    area: "Economy" as PolicyArea,
    parameters: [
      { key: "investment_bn", label: "Investment (£bn)", value: 8, min: 2, max: 25, unit: "£bn" },
      { key: "coverage_pct", label: "Coverage Target (%)", value: 95, min: 75, max: 100, unit: "%" },
    ],
  },
  {
    name: "Clean Air and Net Zero Acceleration Bill",
    description: "Bring forward the 2050 net zero target and ban new petrol cars earlier",
    area: "Environment" as PolicyArea,
    parameters: [
      { key: "target_year", label: "Net Zero Year", value: 2045, min: 2035, max: 2050, unit: "" },
      { key: "petrol_ban_year", label: "Petrol Car Ban Year", value: 2030, min: 2028, max: 2035, unit: "" },
    ],
  },
];
