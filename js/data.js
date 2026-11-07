/**
 * NexusHub Event Management Platform
 * Author: Devdatta Chaudhuri
 * Repository: https://github.com/devdattachaudhuri/eventmanage
 * 
 * Production Dataset: Curated, Diverse, High-Impact Collegiate Engagements
 */

const INITIAL_EVENTS = [
  {
    id: "nh-evt-101",
    title: "NEURAL-HACK 2026: 36-Hour National Autonomous AI & Edge Computing Conclave",
    category: "Technical",
    featured: true,
    tagline: "Architect, build, and deploy next-generation agentic models and edge AI systems",
    date: "December 04 - 06, 2026",
    isoDate: "2026-12-04T09:00:00",
    time: "09:00 AM - 09:00 PM (36H)",
    venue: "Turing Advanced Computing Pavilion & High-Performance Computing Cluster",
    totalSeats: 350,
    bookedSeats: 298,
    price: "Free Access",
    organizer: "NexusHub Computing Syndicate & ACM Student Chapter",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Autonomous Agents", "Edge Computing", "Generative AI", "Rust / WASM", "Cash Prizes"],
    shortDescription: "Flagship 36-hour national sprint bringing together 350+ elite collegiate builders to architect high-throughput agentic prototypes with $15,000 in direct venture grants.",
    longDescription: "Step into the nation's premier student engineering hackathon. NEURAL-HACK 2026 challenges cross-functional teams to engineer, validate, and launch real-time autonomous systems within 36 uninterrupted hours. Participants receive dedicated GPU clusters, hardware sensor kits, direct mentorship from Principal Research Scientists at leading AI laboratories, and round-the-clock catering.",
    agenda: [
      { time: "Day 1 - 08:30 AM", title: "Hardware Check-in & Cluster Allocation", description: "Collect developer swags, register team repositories, and initialize dedicated GPU compute nodes." },
      { time: "Day 1 - 10:00 AM", title: "Problem Statements & Architecture Keynote", description: "Unveiling enterprise and social track challenges with evaluation benchmarks." },
      { time: "Day 1 - 12:00 PM", title: "Hacking Marathon Kickoff", description: "Sprint 1 launches with live architecture validation rounds from staff engineers." },
      { time: "Day 1 - 08:00 PM", title: "Midpoint Code Check-in & System Benchmarking", description: "Automated latency testing and mentor feedback on GitHub PRs." },
      { time: "Day 2 - 08:00 AM", title: "Breakfast & Lightning Developer Talks", description: "Hands-on micro-workshops on local LLM quantization and multimodal streaming." },
      { time: "Day 2 - 03:00 PM", title: "Commit Freeze & Prototype Staging", description: "Production deployments verified on cluster test harnesses." },
      { time: "Day 2 - 06:30 PM", title: "Grand Final Demos & Awards Ceremony", description: "Top 8 teams pitch live on the main amphitheatre stage to venture jury." }
    ],
    speakers: [
      {
        name: "Dr. Alistair Sterling",
        role: "Director of Autonomous Systems, QuantumCore",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Pioneer in distributed inference and embodied robotics control."
      },
      {
        name: "Priyanka Deshmukh",
        role: "Principal Architect, CloudScale Labs",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
        bio: "Specialist in zero-latency gRPC streaming architectures and Kubernetes runtimes."
      }
    ]
  },
  {
    id: "nh-evt-102",
    title: "SYNERGY SPRINT: National FinTech & Quantitative Trading Summit",
    category: "Business",
    featured: false,
    tagline: "Algorithmic market making, high-frequency execution, and DeFi protocols",
    date: "December 11, 2026",
    isoDate: "2026-12-11T10:00:00",
    time: "10:00 AM - 05:30 PM",
    venue: "Wall Street Simulation Lab, Executive Management Complex",
    totalSeats: 180,
    bookedSeats: 162,
    price: "Complimentary Pass",
    organizer: "Finance & Quantitative Economics Society",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Quant Finance", "Algorithmic Trading", "DeFi Protocols", "Risk Modeling"],
    shortDescription: "An intensive summit covering L2/L3 market microstructure, statistical arbitrage bot engineering in Python, and decentralized automated market makers.",
    longDescription: "Dive deep into modern financial engineering and market plumbing. Learn how institutional market makers execute millions of trades per second, backtest statistical pairs-trading models against historical tick-by-tick order book data, and simulate decentralized liquidity pools.",
    agenda: [
      { time: "10:00 AM", title: "Market Microstructure & Order Book Plumbing", description: "Analyzing order book dynamics, depth charts, bid-ask spread mechanics, and latency arbitrage." },
      { time: "11:45 AM", title: "Building a Statistical Arbitrage Bot in Python", description: "Cointegration testing, Z-score thresholds, automated risk sizing, and paper execution." },
      { time: "02:00 PM", title: "DeFi Automated Market Makers & Concentrated Liquidity", description: "Constant product invariants, impermanent loss equations, and flash loan mechanics." },
      { time: "04:00 PM", title: "Live Paper-Trading Alpha Competition", description: "Compete against peers in a simulated order matching engine with cash rewards for best Sharpe ratio." }
    ],
    speakers: [
      {
        name: "Vikram Singhania",
        role: "Chief Quantitative Strategist, AlphaPoint Capital",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "Ex-Citadel algorithmic trader specializing in statistical arbitrage and risk modeling."
      }
    ]
  },
  {
    id: "nh-evt-103",
    title: "KINETIC VOX: Inter-Collegiate Indie Symphony & Electronic Arts Festival",
    category: "Cultural",
    featured: false,
    tagline: "Immersive multi-genre live music, indie rock bands, and spatial audio installations",
    date: "December 18, 2026",
    isoDate: "2026-12-18T17:00:00",
    time: "05:00 PM - 11:30 PM",
    venue: "Central Open-Air Amphitheatre & Lakeside Promenade",
    totalSeats: 1500,
    bookedSeats: 1340,
    price: "₹199 (Festival Pass)",
    organizer: "University Cultural Council & Fine Arts Guild",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Live Concert", "Indie Rock", "Spatial Audio", "Visual Mapping", "Night Fest"],
    shortDescription: "A mesmerizing celebration of sound, light, and performance featuring 8 top university rock and fusion bands followed by headlining EDM and synthwave sets.",
    longDescription: "KINETIC VOX transforms the campus central amphitheatre into an audiovisual wonderland. Experience live bands performing indie fusion, orchestral rock, and electronic synthwave surrounded by 360-degree holographic laser projection mapping and curated food truck avenues.",
    agenda: [
      { time: "05:00 PM", title: "Festival Gates & Street Food Bazaar Opens", description: "Experience artisan craft stalls, interactive VR sound stages, and food lanes." },
      { time: "06:00 PM", title: "Battle of the Bands Championship", description: "Top 8 university bands compete for the prestigious Golden Plectrum trophy." },
      { time: "08:30 PM", title: "Acoustic Sunset Session", description: "Soulful classical-contemporary fusion by the University Strings Ensemble." },
      { time: "09:45 PM", title: "Headline Electronic Set & Laser Spectacular", description: "Live performance by celebrated synthwave duo with synchronized aerial drone light show." }
    ],
    speakers: [
      {
        name: "Arya Sen",
        role: "Sound Designer & Record Producer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        bio: "Grammy-nominated acoustic engineer and spatial audio researcher."
      }
    ]
  },
  {
    id: "nh-evt-104",
    title: "APEX ROBO-ARENA: Heavyweight Autonomous Combat & Drone Slalom",
    category: "Technical",
    featured: false,
    tagline: "Bulletproof cage combat, spinning blades, and autonomous computer-vision drone racing",
    date: "January 08 - 09, 2027",
    isoDate: "2027-01-08T10:00:00",
    time: "10:00 AM - 06:00 PM",
    venue: "Main Indoor Sports Complex & Reinforced Steel Arena",
    totalSeats: 400,
    bookedSeats: 365,
    price: "Free Pass",
    organizer: "Robotics Research Society & Mechatronics Lab",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["RoboWars", "Combat Robotics", "Autonomous Drones", "Computer Vision"],
    shortDescription: "High-octane collegiate combat robotics battle featuring 30kg remote-controlled and autonomous destruction bots competing inside an armored polycarbonate arena.",
    longDescription: "Witness mechanical carnage and elite robotics engineering. From spinning drum weapons running at 8,000 RPM to autonomous FPV quadcopters navigating high-speed obstacles via onboard OpenCV neural nets, APEX ROBO-ARENA tests hardware durability and code precision under extreme forces.",
    agenda: [
      { time: "10:00 AM", title: "Safety Inspection & Weapon Weigh-in", description: "Pneumatics testing, kill switch verifications, and armor checks." },
      { time: "11:30 AM", title: "Autonomous Drone Obstacle Time Trials", description: "Optical flow sensor-guided drone navigation through smoke rings." },
      { time: "02:00 PM", title: "Heavyweight Preliminary Combat Knockouts", description: "3-minute destruction matches in the steel arena." },
      { time: "05:00 PM", title: "Championship Destruction Rumble", description: "Multi-bot survival brawl for the coveted Titanium Wrench trophy." }
    ],
    speakers: [
      {
        name: "Prof. Kenneth Meyer",
        role: "Head of Mechatronics & Autonomous Control",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "Specialist in brushless motor control, telemetry protocols, and rapid metal prototyping."
      }
    ]
  },
  {
    id: "nh-evt-105",
    title: "ZERO-DAY: Advanced Offensive Security & Red Team Cyber Range",
    category: "Workshops",
    featured: false,
    tagline: "Kernel exploitation, supply chain vulnerability research, and live cloud CTF",
    date: "January 15, 2027",
    isoDate: "2027-01-15T09:30:00",
    time: "09:30 AM - 05:00 PM",
    venue: "Cyber Defense Warfare Lab, Information Technology Tower",
    totalSeats: 120,
    bookedSeats: 112,
    price: "Free Access",
    organizer: "NullSector InfoSec & Ethical Hacking Society",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Cybersecurity", "Kernel Exploit", "CTF Contest", "Reverse Engineering"],
    shortDescription: "A hands-on tactical masterclass dissecting real-world vulnerabilities, memory corruption, return-oriented programming (ROP), and Active Directory attack paths.",
    longDescription: "Step into an isolated defensive and offensive security sandbox. Instructed by seasoned security analysts, attendees will disassemble vulnerable binary code, engineer reliable exploits that bypass modern OS mitigations, and storm an enterprise network mock-up in a live Capture-the-Flag tournament.",
    agenda: [
      { time: "09:30 AM", title: "Modern Exploit Primitives & Mitigation Bypasses", description: "Circumventing ASLR, DEP, and stack canaries via ROP chains." },
      { time: "11:30 AM", title: "Hands-on Binary Exploitation Lab", description: "Writing memory corruption exploits using Ghidra, GDB, and pwntools." },
      { time: "02:00 PM", title: "Active Directory Lateral Movement & Kerberoasting", description: "Extracting credentials and escalating privileges in complex domains." },
      { time: "03:45 PM", title: "High-Speed Capture-the-Flag Gauntlet", description: "Live cyber range exercise with real-time attack-defense scoreboard." }
    ],
    speakers: [
      {
        name: "Mira Kasparian",
        role: "Principal Security Researcher, Sentinel Threat Intelligence",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        bio: "Disclosed multiple CVEs in hypervisors and container isolation runtimes."
      }
    ]
  },
  {
    id: "nh-evt-106",
    title: "VORTEX 2027: National Collegiate Esports League & LAN Invitational",
    category: "Sports",
    featured: false,
    tagline: "Valorant, CS2, Rocket League, and EA FC tournament with national broadcast",
    date: "January 22 - 24, 2027",
    isoDate: "2027-01-22T11:00:00",
    time: "11:00 AM - 09:00 PM",
    venue: "Main Arena Esports Stadium & High-Refresh Broadcast Stage",
    totalSeats: 600,
    bookedSeats: 520,
    price: "Free Spectator Pass",
    organizer: "NexusHub Esports Federation",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Esports", "Valorant", "LAN Tournament", "Cash Pool ₹2,00,000", "Live Casting"],
    shortDescription: "The university's flagship inter-collegiate gaming festival. 32 qualified varsity teams battle across 3 game titles on low-latency fiber setups with expert live casting.",
    longDescription: "Experience the thrill of competitive esports at stadium scale. Featuring dedicated 360Hz Alienware tournament rigs, professional broadcast casters, player interview booths, and a community cosplay showcase.",
    agenda: [
      { time: "Day 1 - 11:00 AM", title: "Group Stage Knockouts (Concurrent Streams)", description: "Round-robin matches determining upper and lower bracket seedings." },
      { time: "Day 2 - 01:00 PM", title: "Upper Bracket Semifinals & Cosplay Walk", description: "Best-of-three series on the center stage with studio analysis." },
      { time: "Day 3 - 04:00 PM", title: "Grand Final Match & Trophy Ceremony", description: "Championship best-of-five clash followed by distribution of the ₹2,00,000 prize purse." }
    ],
    speakers: [
      {
        name: "Devon Reed",
        role: "Senior Esports Producer & Commentator",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "Casted major international tournaments with over 5 million viewers."
      }
    ]
  },
  {
    id: "nh-evt-107",
    title: "FOUNDER'S FORGE: Student Startup Pitch & Angel Investor Showcase",
    category: "Business",
    featured: false,
    tagline: "Present your venture prototype directly to angel syndicates and venture capitalists",
    date: "January 29, 2027",
    isoDate: "2027-01-29T10:00:00",
    time: "10:00 AM - 04:30 PM",
    venue: "Innovation & Technology Business Incubator (TBI) Center",
    totalSeats: 150,
    bookedSeats: 132,
    price: "Free Registration",
    organizer: "NexusHub Entrepreneurship Cell & Alumni Venture Network",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Startups", "Venture Capital", "Angel Pitch", "Incubation Grants"],
    shortDescription: "Top 16 shortlisted campus startups deliver 5-minute pitches followed by live Q&A with venture partners from top funds for direct equity-free seed grants.",
    longDescription: "Founder's Forge is where collegiate builders turn prototypes into funded companies. Connect with angel investors, learn how to negotiate seed term sheets, and network with university founders who have built venture-backed companies.",
    agenda: [
      { time: "10:00 AM", title: "Opening Address: The 2027 Early-Stage Playbook", description: "Navigating AI valuations, enterprise pilots, and investor expectations." },
      { time: "11:15 AM", title: "Batch 1 Live Pitch Presentations", description: "8 enterprise and B2B SaaS teams deliver rapid pitches." },
      { time: "01:30 PM", title: "Investor Lunch & Prototype Demo Booths", description: "Informal networking and live product walkthroughs." },
      { time: "03:00 PM", title: "Batch 2 Pitches & Term Sheet Announcements", description: "Consumer tech, hardware, and grant allocations." }
    ],
    speakers: [
      {
        name: "Siddharth Nambiar",
        role: "General Partner, Nexus Venture Collective",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
        bio: "Invested in over 40 early-stage tech companies across deeptech and SaaS."
      }
    ]
  },
  {
    id: "nh-evt-108",
    title: "DESIGN DISRUPT: Generative UI, Spatial Computing & Motion Systems",
    category: "Workshops",
    featured: false,
    tagline: "Craft modern interface micro-interactions, 3D WebGL scenes, and Figma design tokens",
    date: "February 05, 2027",
    isoDate: "2027-02-05T13:30:00",
    time: "01:30 PM - 06:30 PM",
    venue: "Media Arts & Human-Computer Interaction Lab, Campus 7",
    totalSeats: 90,
    bookedSeats: 78,
    price: "Free Access",
    organizer: "Interactive Media & Product Design Society",
    image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["UI/UX Design", "Figma", "WebGL", "Motion Design", "Design Systems"],
    shortDescription: "A hands-on masterclass for digital product designers and creative developers exploring fluid physics, spatial UX patterns, and scalable design token architectures.",
    longDescription: "Break beyond mundane templates. Learn how leading design studios craft viral interfaces using spring physics, custom shaders in Three.js, accessibility-compliant color contrast models, and component state machines.",
    agenda: [
      { time: "01:30 PM", title: "The Anatomy of a Modern Design System", description: "Multi-platform design tokens, semantic color mappings, and auto-layout mechanics." },
      { time: "03:00 PM", title: "Interactive Prototyping with Spring Physics", description: "Building micro-interactions that feel tangible using Framer and vanilla CSS transforms." },
      { time: "04:45 PM", title: "Introduction to Shaders & WebGL for UI", description: "Creating ambient background meshes and reactive glass textures." }
    ],
    speakers: [
      {
        name: "Chloe Dupont",
        role: "Design Director, Studio Lumina",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
        bio: "Recipient of multiple Awwwards and Apple Design Award nominations."
      }
    ]
  },
  {
    id: "nh-evt-109",
    title: "TITAN CUP: National Inter-Collegiate 5v5 Basketball Championship & Dunk Derby",
    category: "Sports",
    featured: false,
    tagline: "High-flying varsity basketball championship, 3-point shootout, and half-time dunk exhibition",
    date: "February 12 - 14, 2027",
    isoDate: "2027-02-12T16:00:00",
    time: "04:00 PM - 09:30 PM",
    venue: "Indoor Stadium Arena & Central Hardwood Court",
    totalSeats: 1200,
    bookedSeats: 1045,
    price: "Free Student Admittance",
    organizer: "Varsity Athletics Board & Physical Education Department",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&auto=format&fit=crop&q=75",
    tags: ["Basketball", "Varsity League", "Dunk Contest", "3-Point Shootout", "College Sports"],
    shortDescription: "The zenith of campus sports. 16 top university basketball squads clash on the hardwood in a high-intensity single-elimination tournament with national scouts.",
    longDescription: "Feel the hardwood thunder as the nation's premier student-athletes battle for collegiate basketball supremacy. Featuring state-of-the-art shot clock telemetry, multi-camera arena jumbotrons, live mascot entertainment, and the exhilarating All-Star Halftime Dunk Derby with celebrity judges.",
    agenda: [
      { time: "Day 1 - 04:00 PM", title: "Opening Ceremonies & Quarterfinal Matches", description: "Team tip-offs across two concurrent courts with live pep band performances." },
      { time: "Day 2 - 05:30 PM", title: "National 3-Point Shootout & Semifinals", description: "Top perimeter shooters contest the 60-second rapid-fire money-ball rack challenge." },
      { time: "Day 3 - 06:30 PM", title: "All-Star Dunk Exhibition & Grand Championship", description: "High-flying rim-rattling dunks evaluated by guest judges followed by the title match and ring presentation." }
    ],
    speakers: [
      {
        name: "Coach Rajesh Vardhan",
        role: "Director of Varsity Athletics & Former National Coach",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
        bio: "Guided university squads to 6 consecutive national university sports championships."
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.INITIAL_EVENTS = INITIAL_EVENTS;
}
