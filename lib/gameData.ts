import { v4 as uuidv4 } from "uuid";
import { NPC, Party, Role, PolicyArea, NPCTrait, ScenarioCabinetMember, GeneratedScenario } from "./store/types";

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

const NAMES = {
  whiteMaleFirst: ["James", "Michael", "Robert", "John", "David", "William", "Richard", "Thomas", "Charles", "George", "Edward", "Oliver", "Harry", "Jack", "Jacob", "Rory", "Jeremy", "Boris", "Keir", "Nigel", "Giles", "Tarquin", "Rupert", "Alistair", "Tristan", "Dominic"],
  whiteFemaleFirst: ["Sarah", "Emma", "Helen", "Claire", "Margaret", "Elizabeth", "Victoria", "Rachel", "Angela", "Catherine", "Harriet", "Penny", "Liz", "Theresa", "Yvette", "Bridget", "Priscilla", "Fiona", "Caroline", "Eleanor", "Pippa", "Jocelyn", "Camilla"],
  whiteLast: ["Smith", "Jones", "Williams", "Brown", "Davies", "Evans", "Wilson", "Taylor", "Thomas", "Roberts", "Johnson", "Lewis", "Walker", "Wood", "White", "Watson", "Jackson", "Wright", "Green", "Harris", "Cooper", "King", "Rees-Mogg", "Starmer", "Blair", "Gove", "Hunt", "Truss", "Miliband", "Cholmondeley", "Farage", "Fabricant", "Villiers", "Jenkin", "Bone"],
  asianMaleFirst: ["Rishi", "Sadiq", "Sajid", "Anas", "Tariq", "Imran", "Mohammed", "Ali", "Raj", "Amit", "Rahul", "Zayn", "Humza", "Hassan"],
  asianFemaleFirst: ["Priya", "Nadia", "Fatima", "Zahra", "Aisha", "Preeti", "Sunita", "Shabana", "Rupa", "Tulip", "Suella", "Priti", "Nusrat"],
  asianLast: ["Patel", "Khan", "Ahmed", "Ali", "Singh", "Sharma", "Gupta", "Hussain", "Rahman", "Shah", "Begum", "Javid", "Sunak", "Zahawi", "Mahmood"],
  blackMaleFirst: ["Kwame", "Marcus", "Winston", "David", "Michael", "Samuel", "Joseph", "Clive", "Trevor", "Vaughan", "Chi", "Mark"],
  blackFemaleFirst: ["Diane", "Kemi", "Ngozi", "Dawn", "Florence", "Abena", "Grace", "Joy", "Marsha", "Bell", "Eleanor", "Kate"],
  blackLast: ["Adebayo", "Osei", "Boateng", "Smith", "Johnson", "Williams", "Brown", "Abbott", "Badenoch", "Lammy", "Kwarteng", "Cleverly", "Afolami", "Osamor", "Onwurah"]
};

// ─── Demographics Generators ──────────────────────────────────────────────────

const TORY_PERSONALITIES = [
  "patrician grandee who believes governance is a duty not a career.",
  "ex-military figure who values chain of command above all.",
  "free-market ideologue who advocates for slash-and-burn economics.",
  "rural traditionalist suspicious of urban modernization.",
  "City banker turned politician with deep pockets.",
  "loyalist who would walk off a cliff if the party leader asked.",
  "Thatcherite purist who regularly rebels against tax rises."
];

const LABOUR_PERSONALITIES = [
  "former union rep who considers themselves the workers' tribune.",
  "human rights lawyer built for scrutiny and debate.",
  "public sector worker intimately familiar with austerity's impact.",
  "inner-city grassroots campaigner focused on local poverty.",
  "academic economist who brings data to every argument.",
  "firebrand idealist who'd rather lose the whip than betray principles.",
  "soft-spoken intellectual whose Commons speeches are devastating."
];

const LIBDEM_PERSONALITIES = [
  "local councillor made good, obsessed with pavement politics.",
  "centrist technocrat who deplores ideological extremes.",
  "ardent Europhile fighting to rebuild ties with the continent."
];

const GENERAL_PERSONALITIES = [
  "cautious pragmatist who votes with the party but harbours private doubts.",
  "calculating operator who builds alliances across party lines.",
  "media-hungry backbencher who courts controversy for column inches.",
  "constituency champion who puts local interests above national politics.",
  "former journalist who knows where all the bodies are buried.",
  "second-generation immigrant who sees politics as service."
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

function getPersonality(party: string) {
  const pool = [...GENERAL_PERSONALITIES];
  if (party === "Conservative" || party === "Reform UK") pool.push(...TORY_PERSONALITIES, ...TORY_PERSONALITIES);
  if (party === "Labour" || party === "Green") pool.push(...LABOUR_PERSONALITIES, ...LABOUR_PERSONALITIES);
  if (party === "Liberal Democrat") pool.push(...LIBDEM_PERSONALITIES, ...LIBDEM_PERSONALITIES);

  const baseDesc = randomFrom(pool);

  // Determine implied age prefix based on party demographics
  let ageGroup = "middle-aged, ";
  const r = Math.random();
  if (party === "Conservative" || party === "Reform UK") {
      if (r < 0.6) ageGroup = "older, ";
      else if (r < 0.9) ageGroup = "middle-aged, ";
      else ageGroup = "surprisingly young, ";
  } else if (party === "Labour" || party === "Green") {
      if (r < 0.4) ageGroup = "young, ";
      else if (r < 0.8) ageGroup = "middle-aged, ";
      else ageGroup = "veteran, older ";
  } else {
      if (r < 0.3) ageGroup = "young, ";
      else if (r < 0.7) ageGroup = "middle-aged, ";
      else ageGroup = "older, ";
  }

  const lowerDesc = baseDesc.charAt(0).toLowerCase() + baseDesc.slice(1);
  return `A ${ageGroup}${lowerDesc}`;
}

function generateDemographics(party: string, region: string) {
  // Gender
  let femaleChance = 0.30;
  if (party === "Labour" || party === "Green" || party === "Liberal Democrat") femaleChance = 0.50;
  if (party === "Reform UK") femaleChance = 0.20;
  const isFemale = Math.random() < femaleChance;

  // Ethnicity 
  let diversityChance = 0.15;
  if (region === "London") diversityChance = 0.45;
  else if (region === "West Midlands" || region === "North West England" || region === "Yorkshire & the Humber") diversityChance = 0.25;
  else if (region === "Scotland" || region === "Wales" || region === "South West England") diversityChance = 0.05;

  if (party === "Conservative" || party === "Reform UK" || party === "SNP") diversityChance *= 0.6;
  if (party === "Labour" || party === "Green") diversityChance *= 1.3;

  let ethnicity = "white";
  if (Math.random() < diversityChance) {
    ethnicity = Math.random() < 0.6 ? "asian" : "black";
  }

  let firstNames, lastNames;
  if (ethnicity === "asian") {
    firstNames = isFemale ? NAMES.asianFemaleFirst : NAMES.asianMaleFirst;
    lastNames = NAMES.asianLast;
  } else if (ethnicity === "black") {
    firstNames = isFemale ? NAMES.blackFemaleFirst : NAMES.blackMaleFirst;
    lastNames = NAMES.blackLast;
  } else {
    firstNames = isFemale ? NAMES.whiteFemaleFirst : NAMES.whiteMaleFirst;
    lastNames = NAMES.whiteLast;
  }

  return `${randomFrom(firstNames)} ${randomFrom(lastNames)}`;
}

export function generateInitialNPCs(
  playerParty: Party,
  scenario: GeneratedScenario | null
): NPC[] {
  const npcs: NPC[] = [];
  const usedConstituencies = new Set<string>();

  const assignConstituency = () => {
    const region = randomFrom(Object.keys(CONSTITUENCIES_BY_REGION));
    const baseList = CONSTITUENCIES_BY_REGION[region];
    let name = randomFrom(baseList);

    // Generate unique constituency names if we run out of the hardcoded 150
    if (usedConstituencies.has(name)) {
      const suffixes = ["North", "South", "East", "West", "Central", "Rural"];
      name = `${name} ${randomFrom(suffixes)}`;
      while (usedConstituencies.has(name)) {
        name = `${name} & ${randomFrom(baseList)}`;
      }
    }
    usedConstituencies.add(name);
    return { name, region };
  };

  const cabinetFromScenario = scenario?.cabinet || [];

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

    const location = assignConstituency();

    npcs.push({
      id: uuidv4(),
      name: cm.name,
      party: cm.party,
      role: resolvedRole,
      constituency: location.name,
      traits: randomTraits(),
      stances: randomStances(),
      loyaltyToPlayer: cm.party === playerParty ? randomInt(15, 55) : randomInt(-50, 10),
      personalRelationship: randomInt(-15, 15),
      ministerialRole: isCabinet ? cm.role : undefined,
      isInCabinet: isCabinet,
      corruptionLevel: randomInt(0, 30),
      personalityDescription: cm.description || getPersonality(cm.party),
    });
  }

  // 2. Fill remaining slots to hit 650 total based on election results
  const targetCounts: Record<string, number> = {};
  if (scenario?.results) {
    for (const [p, result] of Object.entries(scenario.results)) {
      targetCounts[p] = result.seats;
    }
  } else {
    // Default backup to hit 650 if no scenario exists
    targetCounts["Labour"] = 412;
    targetCounts["Conservative"] = 121;
    targetCounts["Liberal Democrat"] = 72;
    targetCounts["SNP"] = 43;
    targetCounts["Reform UK"] = 5;
    targetCounts["Green"] = 4;
    targetCounts["Independent"] = 9;
  }

  let isPlayerPartyCounted = false;

  for (const [partyName, target] of Object.entries(targetCounts)) {
    const p = partyName as Party;
    const currentCount = npcs.filter((n) => n.party === p).length;
    let toAdd = Math.max(0, target - currentCount);

    if (p === playerParty && !isPlayerPartyCounted) {
      toAdd = Math.max(0, toAdd - 1); // Remove 1 seat allocation for the player
      isPlayerPartyCounted = true;
    }

    for (let i = 0; i < toAdd; i++) {
      const location = assignConstituency();
      const name = generateDemographics(p, location.region);

      let role: Role = "Backbencher";
      if (p === scenario?.governmentParty) {
        role = randomFrom(["Junior Minister", "Backbencher", "Backbencher", "Parliamentary Private Secretary"]);
      } else if (p === npcs.find((n) => n.role === "Leader of the Opposition")?.party) {
        role = randomFrom(["Shadow Cabinet", "Backbencher", "Backbencher"]);
      }

      npcs.push({
        id: uuidv4(),
        name,
        party: p,
        role,
        constituency: location.name,
        traits: randomTraits(),
        stances: randomStances(),
        loyaltyToPlayer: p === playerParty ? randomInt(20, 60) : randomInt(-40, 20),
        personalRelationship: randomInt(-20, 20),
        ministerialRole: undefined,
        isInCabinet: false,
        corruptionLevel: randomInt(0, 40),
        personalityDescription: getPersonality(p),
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
