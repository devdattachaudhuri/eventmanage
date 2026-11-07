/**
 * CampusPulse Event Management Platform
 * Author: Devdatta Chaudhuri
 * Repository: https://github.com/devdattachaudhuri/eventmanage
 * 
 * Mock Dataset: Realistic campus events across multiple domains
 */

const INITIAL_EVENTS = [
  {
    id: "cp-evt-101",
    title: "CAMPUS-HACK 2026: 36-Hour National AI & Cloud Hackathon",
    category: "Technical",
    featured: true,
    tagline: "Build the future of autonomous systems and distributed intelligence",
    date: "November 25, 2026",
    isoDate: "2026-11-25T09:00:00",
    time: "09:00 AM - 09:00 PM (36H)",
    venue: "APJ Abdul Kalam Grand Auditorium & Innovation Lab Complex",
    totalSeats: 300,
    bookedSeats: 264,
    price: "Free Pass",
    organizer: "CampusPulse Computing Syndicate & IEEE Student Branch",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Artificial Intelligence", "Hackathon", "Cloud Native", "Web3", "Cash Prizes"],
    shortDescription: "The premier collegiate hackathon uniting 300+ elite engineers, builders, and designers competing across GenAI, Web3 infrastructure, and IoT tracks with $10,000 in grand grants.",
    longDescription: "Step into the most intensive engineering marathon of the year. CAMPUS-HACK 2026 challenges cross-functional teams to conceptualize, architect, and ship production-ready prototypes within 36 uninterrupted hours. Participants receive mentorship from Principal Architects at Google, AWS, and NVIDIA, along with dedicated cloud compute credits, hardware sandbox kits, high-speed fiber connectivity, and round-the-clock catering.",
    agenda: [
      { time: "Day 1 - 08:30 AM", title: "Registration & Hardware Check-in", description: "Badge pickup, swags collection, team matchmaking, and compute cluster onboarding." },
      { time: "Day 1 - 10:00 AM", title: "Opening Keynote & Problem Statements", description: "Official announcement of industry challenge tracks and evaluation rubrics." },
      { time: "Day 1 - 12:00 PM", title: "Hacking Sprint Begins", description: "Sprint 1 kicks off with dedicated mentor rounds and architecture validation." },
      { time: "Day 1 - 08:00 PM", title: "Mid-Way Code Reviews & Tech Demos", description: "Check-in milestone with mentor feedback on Git repositories." },
      { time: "Day 2 - 08:00 AM", title: "Morning Breakfast & Refuel", description: "Sponsor breakout rooms, developer lightning talks, and VR lounge." },
      { time: "Day 2 - 04:00 PM", title: "Code Freeze & Pitch Prelims", description: "Final Git commit lock, staging server deployments, and table-top judging." },
      { time: "Day 2 - 07:30 PM", title: "Grand Finale Demos & Award Gala", description: "Top 8 finalists take the main stage for 3-minute live demos before executive jury." }
    ],
    speakers: [
      {
        name: "Dr. Evelyn Vance",
        role: "VP of Research, NeuralLabs",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        bio: "Pioneering researcher in transformer optimizations and multimodal inference."
      },
      {
        name: "Marcus Chen",
        role: "Distinguished Engineer, HyperScale Cloud",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Kubernetes core contributor and distributed systems architect."
      },
      {
        name: "Aanya Sharma",
        role: "Head of Developer Ecosystem, DevVentures",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
        bio: "Investor and community strategist championing early-stage university founders."
      }
    ]
  },
  {
    id: "cp-evt-102",
    title: "AURA 2026: Cosmic Music & Multi-Genre Cultural Fest",
    category: "Cultural",
    featured: false,
    tagline: "An electrifying neon carnival of music, drama, and digital visual art",
    date: "December 04, 2026",
    isoDate: "2026-12-04T17:00:00",
    time: "05:00 PM - 11:30 PM",
    venue: "Central Open-Air Amphitheatre (OAT)",
    totalSeats: 1200,
    bookedSeats: 1110,
    price: "Student ID Pass",
    organizer: "Student Cultural Council & Fine Arts Society",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    tags: ["EDM", "Indie Rock", "Visual Arts", "Cosplay", "Food Fiesta"],
    shortDescription: "Experience an interstellar cultural kaleidoscope featuring headline indie bands, international EDM acts, projection-mapping installations, and campus battle-of-the-bands.",
    longDescription: "AURA stands as Eastern India's largest annual collegiate cultural festival. Step into a transformed neon dreamscape spanning three dynamic stages: the Stellar Main Stage for headline musicians, the Chroma Dome for acoustic, folk, and classical ensembles, and the Cyber Street for street plays, culinary pop-ups, and interactive laser installations.",
    agenda: [
      { time: "05:00 PM", title: "Carnival Gates Open", description: "Food trucks, interactive photobooths, and artisanal bazaar stalls open." },
      { time: "06:00 PM", title: "Battle of the Bands", description: "Top 6 university rock and fusion bands battle for the Golden Plectrum." },
      { time: "08:00 PM", title: "Symphonic Choreography", description: "Theatrical dance performance by the Zenith Contemporary Dance Troupe." },
      { time: "09:30 PM", title: "Headline Concert & Laser Spectacular", description: "Live performance by celebrated indie electronic duo 'The Luminary Echo'." }
    ],
    speakers: [
      {
        name: "Rohan Deshmukh",
        role: "Platinum Music Producer & Sound Designer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "Known for blending traditional ethnic instrumentation with ambient synthwave."
      },
      {
        name: "Kyra Sen",
        role: "Visual FX Director & Kinetic Light Artist",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Curator of stadium-scale generative 3D projection spectacles."
      }
    ]
  },
  {
    id: "cp-evt-103",
    title: "CYBER-DEFENSE: Red Teaming & Offensive Security Masterclass",
    category: "Workshops",
    featured: false,
    tagline: "Hands-on threat emulation, memory exploitation, and zero-day defense",
    date: "November 28, 2026",
    isoDate: "2026-11-28T10:00:00",
    time: "10:00 AM - 04:30 PM",
    venue: "Cyber Defense Warfare Range, 4th Floor, Tech Block C",
    totalSeats: 80,
    bookedSeats: 74,
    price: "Seat by Selection",
    organizer: "Nullcon Campus Chapter & InfoSec Syndicate",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    tags: ["Cybersecurity", "Red Teaming", "Reverse Engineering", "Linux Kernel"],
    shortDescription: "An intensive hands-on lab workshop taking participants through real-world attack vectors, buffer overflow exploits, Active Directory pivoting, and zero-trust perimeter defense.",
    longDescription: "Taught by certified offensive security operators, this masterclass drops attendees straight into a simulated air-gapped enterprise network. You will set up command-and-control servers, identify zero-day vulnerabilities in sandboxed kernel modules, and implement defensive telemetry to stop advanced persistent threats.",
    agenda: [
      { time: "10:00 AM", title: "Offensive Mindset & Threat Modeling", description: "Deconstructing modern supply-chain attacks and APT tactics." },
      { time: "11:30 AM", title: "Live Lab: Buffer Overflow & Shellcoding", description: "Writing memory corruptions, DEP bypasses, and return-oriented programming (ROP)." },
      { time: "01:30 PM", title: "Network Lateral Movement & Privilege Escalation", description: "Breaching Active Directory domains and abusing Kerberos tickets." },
      { time: "03:30 PM", title: "Capture The Flag (CTF) Sprint", description: "Individual high-speed challenge with dynamic scoreboard and prize vouchers." }
    ],
    speakers: [
      {
        name: "Vikramaditya Roy",
        role: "Principal Red Teamer, CyGuard Defense",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "OSCP, OSCE3, and regular keynote speaker at Black Hat & Defcon."
      }
    ]
  },
  {
    id: "cp-evt-104",
    title: "TITANS LEAGUE: Inter-Collegiate Esports & Futsal Championship",
    category: "Sports",
    featured: false,
    tagline: "Where high-octane physical endurance meets apex competitive gaming",
    date: "December 01, 2026",
    isoDate: "2026-12-01T08:00:00",
    time: "08:00 AM - 08:00 PM",
    venue: "Indoor Stadium & K-Sports Arena",
    totalSeats: 450,
    bookedSeats: 320,
    price: "Registration Free",
    organizer: "Department of Physical Education & Sports Council",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    tags: ["Esports", "Valorant", "Futsal", "Athletics", "Tournaments"],
    shortDescription: "Dual-arena tournament bringing university athletes and competitive esports rosters into head-to-head combat across 5v5 Futsal, Valorant, and Rocket League.",
    longDescription: "The Titans League bridges physical athleticism with digital gaming excellence. Watch 32 university teams duel in high-velocity 5v5 Futsal on synthetic turf courts, while the Esports Arena features professional 240Hz setups, live shoutcasters, spectator stands, and real-time analytical telemetry.",
    agenda: [
      { time: "08:00 AM", title: "Opening Ceremony & Athlete Oath", description: "Torch relay, team roll-call, and sportsmanship pledge." },
      { time: "09:30 AM", title: "Futsal League Matches (Pitch A & B)", description: "High-paced 20-minute knockout group rounds." },
      { time: "01:00 PM", title: "Esports Upper Bracket Semifinals", description: "Valorant best-of-three semi-finals on the main stage." },
      { time: "05:00 PM", title: "Futsal Grand Final & Halftime Show", description: "Championship match under high-intensity arena floodlights." },
      { time: "07:00 PM", title: "Trophy Presentation & MVP Awards", description: "Awarding the Titan Cup and individual high-scorer golden boots." }
    ],
    speakers: [
      {
        name: "Coach Arjun Nair",
        role: "National Futsal Coach & FIFA Licensee",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80",
        bio: "Former national player committed to grassroots athletic development."
      },
      {
        name: "Siddharth 'Zenith' Ray",
        role: "Pro Esports Caster & Analyst",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
        bio: "Official voice of VCT Pacific and South Asian regional esports leagues."
      }
    ]
  },
  {
    id: "cp-evt-105",
    title: "E-VENTURE CONCLAVE: Global Angel Pitch & Startup Expo",
    category: "Business",
    featured: false,
    tagline: "Connecting student visionaries with seed capital, angel networks, and venture funds",
    date: "December 08, 2026",
    isoDate: "2026-12-08T09:30:00",
    time: "09:30 AM - 06:00 PM",
    venue: "Senate Hall & Executive Convention Center",
    totalSeats: 200,
    bookedSeats: 188,
    price: "Delegate Pass",
    organizer: "Centre for Innovation & Entrepreneurship (CIE)",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Startups", "Venture Capital", "Angel Pitch", "Networking", "Product Demo"],
    shortDescription: "A high-stakes entrepreneurship summit featuring 20 curated collegiate startups pitching live to prominent venture capital partners for equity funding and incubator grants.",
    longDescription: "The E-Venture Conclave accelerates deep-tech and consumer innovations originating from university laboratories into scalable businesses. Founders engage in 1-on-1 pitch speed-dating with tier-1 venture capitalists, attend legal and fundraising workshops, and demo products in the Startup Alley.",
    agenda: [
      { time: "09:30 AM", title: "Inaugural Keynote: Zero to Seed Stage", description: "Unlocking product-market fit in hyper-competitive markets." },
      { time: "11:00 AM", title: "Live Elevator Pitch Battle", description: "Top 20 student ventures deliver 180-second pitches to angel investors." },
      { time: "01:30 PM", title: "Investor Luncheon & Networking Tables", description: "Curated networking over lunch with venture partners." },
      { time: "03:00 PM", title: "VC Panel: Navigating SaaS & Hardware Valuations", description: "Interactive fireside chat with partners from Sequoia, Accel, and Blume." },
      { time: "05:00 PM", title: "Commitment Term Sheet Announcements", description: "Live grant dispatches and term-sheet offers to top 3 startups." }
    ],
    speakers: [
      {
        name: "Shalini Kapoor",
        role: "Managing Partner, AlphaX Ventures",
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80",
        bio: "Veteran early-stage tech investor managing a $120M seed portfolio."
      },
      {
        name: "Tanmay Bhattacharya",
        role: "Founder & CEO, NexaFleet (Unicorn)",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
        bio: "Campus alumnus who scaled an AI logistics startup to 14 countries."
      }
    ]
  },
  {
    id: "cp-evt-106",
    title: "QUANTUM NEXT: Hands-On Quantum Computing with Qiskit",
    category: "Technical",
    featured: false,
    tagline: "Manipulating qubits, superposition circuits, and Grover search algorithms",
    date: "December 12, 2026",
    isoDate: "2026-12-12T10:00:00",
    time: "10:00 AM - 05:00 PM",
    venue: "Advanced Simulation Computing Center, Room 302",
    totalSeats: 60,
    bookedSeats: 58,
    price: "Free Access",
    organizer: "Quantum Information Science Group & IBM Quantum Academic Partner",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    tags: ["Quantum Computing", "Qiskit", "Physics", "Algorithms"],
    shortDescription: "Demystify quantum mechanics through code. Learn quantum circuit simulation, entanglement state preparation, and run quantum algorithms on actual IBM Q cloud hardware.",
    longDescription: "Move beyond classical bits. This comprehensive technical immersion guides students through the mathematical fundamentals of Hilbert spaces, Bloch spheres, and Bell state creation, culminating in writing real Python circuits deployed to superconducting quantum backends via IBM Quantum cloud APIs.",
    agenda: [
      { time: "10:00 AM", title: "From Bits to Qubits: Foundations", description: "Superposition, quantum measurement postulate, and unitary operators." },
      { time: "11:30 AM", title: "Single and Multi-Qubit Gate Labs", description: "Pauli-X/Y/Z, Hadamard, CNOT, and Phase-shift gates in Qiskit." },
      { time: "02:00 PM", title: "Quantum Teleportation & Superdense Coding", description: "Constructing and simulating quantum communication protocols." },
      { time: "03:45 PM", title: "Live Hardware Dispatch to IBM Quantum System One", description: "Submitting error-mitigated job circuits to physical quantum processors." }
    ],
    speakers: [
      {
        name: "Dr. Alistair MacIntyre",
        role: "Lead Quantum Physicist, Q-Systems Global",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
        bio: "Specialist in fault-tolerant topological quantum error correction."
      }
    ]
  },
  {
    id: "cp-evt-107",
    title: "ROBO-WARS: Autonomous Drone Obstacle & Bot Combat Derby",
    category: "Technical",
    featured: false,
    tagline: "Kinetic metal clashes, autonomous quadcopter swarms, and pneumatic crushers",
    date: "December 15, 2026",
    isoDate: "2026-12-15T11:00:00",
    time: "11:00 AM - 06:30 PM",
    venue: "Armored Combat Arena, Mechanical Engineering Plaza",
    totalSeats: 500,
    bookedSeats: 485,
    price: "Spectator Pass",
    organizer: "Robotics Society & Mechatronics Guild",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    tags: ["Robotics", "Drones", "Combat Bots", "Embedded Systems"],
    shortDescription: "Eastern India's most violent robotic clash. 60kg combat bots armed with spinning titanium discs, flippers, and pneumatic hammers battle inside a polycarbonate cage.",
    longDescription: "Experience pure mechanical thrill! Along with heavyweight combat matches, the event hosts an autonomous FPV drone time-attack race navigating optical flow gates and laser grids without human joystick inputs.",
    agenda: [
      { time: "11:00 AM", title: "Bot Safety Checks & Weapon Weigh-in", description: "Failsafe radio checks, kinetic energy limits, and armor inspection." },
      { time: "12:30 PM", title: "Autonomous Drone Swarm Slalom", description: "Vision-based obstacle evasion time trials." },
      { time: "02:30 PM", title: "Heavyweight Combat Preliminary Bouts", description: "3-minute destruction matches inside bulletproof poly-carbonate enclosure." },
      { time: "05:00 PM", title: "Championship Destruction Derby", description: "Multi-bot survival rumble for the Golden Spark Trophy." }
    ],
    speakers: [
      {
        name: "Er. Kuntal Banerjee",
        role: "Robotics Architect & BattleBots Judge",
        avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80",
        bio: "20-year veteran of combat robotics and autonomous defense drones."
      }
    ]
  },
  {
    id: "cp-evt-108",
    title: "RHYTHM & REELS: Indie Cinema Gala & Live Stage Plays",
    category: "Cultural",
    featured: false,
    tagline: "Celebrating cinematic storytelling, stage drama, and scriptwriting craft",
    date: "December 19, 2026",
    isoDate: "2026-12-19T16:00:00",
    time: "04:00 PM - 10:00 PM",
    venue: "Main Campus Film Theatre & Blackbox Studio",
    totalSeats: 350,
    bookedSeats: 215,
    price: "Campus Pass",
    organizer: "Film Society & Dramatic Guild",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    tags: ["Cinema", "Short Films", "Theatre", "Storytelling", "Acting"],
    shortDescription: "A night of cinematic immersion presenting student-directed short films, live proscenium plays, and script workshops hosted by National Film Award winning artists.",
    longDescription: "Rhythm & Reels invites lovers of dramatic storytelling to witness poignant contemporary scripts enacted on stage, followed by an official screening selection of 10 student short films judged on cinematography, sound design, and narrative coherence.",
    agenda: [
      { time: "04:00 PM", title: "Screenplay Reading & Critique", description: "Table reads of selected original dramatic scripts." },
      { time: "05:30 PM", title: "Proscenium Play: 'Echoes of Silence'", description: "45-minute original production by the University Dramatics Troupe." },
      { time: "07:00 PM", title: "Short Film Screening Showcase", description: "Screening of 10 official festival selections in 4K with Dolby Atmos audio." },
      { time: "09:00 PM", title: "Director Q&A & Award Laurels", description: "Panel discussion with creators and presentation of Best Director Laurel." }
    ],
    speakers: [
      {
        name: "Ananya Sen Gupta",
        role: "Film Director & Screenplay Mentor",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
        bio: "Independent filmmaker with official selections at Berlinale and MAMI."
      }
    ]
  },
  {
    id: "cp-evt-109",
    title: "FINTECH FORWARD: Algorithmic Trading & DeFi Summit",
    category: "Business",
    featured: false,
    tagline: "High-frequency strategies, liquidity protocols, and automated risk models",
    date: "December 22, 2026",
    isoDate: "2026-12-22T09:00:00",
    time: "09:00 AM - 05:00 PM",
    venue: "Finance Lab & Bloomberg Terminal Suite",
    totalSeats: 150,
    bookedSeats: 142,
    price: "Student Pass",
    organizer: "School of Management & Quantitative Finance Club",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    tags: ["Fintech", "Algorithmic Trading", "Quantitative Finance", "DeFi", "Python"],
    shortDescription: "Learn how quant hedge funds and automated market makers build low-latency trading engines, statistical arbitrage models, and decentralized liquidity pools.",
    longDescription: "Dive into quantitative finance. Through live Bloomberg terminal demos and Python Jupyter notebook backtesting, participants explore market microstructure, order book dynamics, statistical pairs trading, and smart contract protocol liquidity engineering.",
    agenda: [
      { time: "09:00 AM", title: "Order Book Dynamics & Market Microstructure", description: "L2/L3 data streams, bid-ask spread math, and latency arbitrage." },
      { time: "11:00 AM", title: "Building a Mean-Reverting Pairs Trading Bot in Python", description: "Cointegration testing, Z-score thresholds, and automated risk sizing." },
      { time: "01:30 PM", title: "Automated Market Makers & Constant Product Invariants", description: "Deconstructing Uniswap v3/v4 concentrated liquidity mechanisms." },
      { time: "03:30 PM", title: "Live Paper-Trading Challenge", description: "Real-time simulated market test with monetary prizes for highest Sharpe ratio." }
    ],
    speakers: [
      {
        name: "Prateek Singhania",
        role: "Senior Quantitative Researcher, Apex Alpha Capital",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "Specializing in high-frequency statistical arbitrage and algorithmic order routing."
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.INITIAL_EVENTS = INITIAL_EVENTS;
}
