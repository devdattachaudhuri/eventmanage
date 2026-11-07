# NexusHub Event Management Platform

> **Author:** Devdatta Chaudhuri  
> **GitHub Repository:** [https://github.com/devdattachaudhuri/eventmanage](https://github.com/devdattachaudhuri/eventmanage)  
> **Live Demo:** [https://devdattachaudhuri.github.io/eventmanage/](https://devdattachaudhuri.github.io/eventmanage/)  
> **Technology Stack:** Pure Vanilla Web Standards (HTML5, Modern CSS3, ES6+ JavaScript)  
> **Dependencies:** Zero external frameworks, zero build steps, zero external npm/CDN libraries  

---

## 1. Project Explanation

**NexusHub** is a production-grade, fully responsive campus event discovery and digital pass reservation platform tailored for university ecosystems, student activity centers, and technical societies. It provides students, researchers, faculty, and industry guests with a centralized gateway to discover, inspect, and register for flagship academic hackathons, cultural festivals, varsity sports tournaments, cybersecurity ranges, and venture pitch conclaves.

The application operates completely offline and client-side without relying on third-party runtime dependencies, external bundlers (Webpack, Vite), or frontend frameworks (React, Vue). Launching `index.html` in any standard web browser yields an interactive application featuring 3D physics, real-time ticket inventory synchronization, and cryptographic-style digital boarding passes.

### Core Objectives:
- **Zero-Latency Event Exploration:** Real-time multi-attribute search and category filtering with instantaneous DOM reconciliation.
- **Seat Allocation Integrity:** Live client-side concurrency control, visual capacity meters, and duplicate booking prevention.
- **Self-Contained Digital Boarding Passes:** High-contrast, printable event admittance credentials generated on-the-fly, featuring dynamic 2D barcodes drawn via pure HTML5 Canvas mathematics.
- **Cyber-Neomorphic & 3D Glassmorphism Aesthetics:** Modern visual hierarchy using backdrop filters, floating mesh glow fields, and mouse-tracking spatial parallax.

---

## 2. Platform Architecture

The system architecture adheres strictly to clean separation of concerns across 5 modular files, eliminating dependency graphs and configuration overhead:

```
devproj/
├── index.html          # Semantic HTML5 document, accessible modal dialogs, and SVG icons
├── css/
│   └── style.css       # Complete design system: CSS custom properties, 3D transforms, print media
├── js/
│   ├── data.js         # Realistic campus events dataset across multiple technical & cultural domains
│   └── app.js          # Core application logic: state machine, 3D tilt, QR generator, DOM controller
└── README.md           # Engineering documentation authored by Devdatta Chaudhuri
```

### Architectural Subsystems:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  Semantic HTML5  •  CSS3 Custom Properties  •  3D Card Perspective     │
│  Backdrop Filters  •  Canvas Particles  •  Print Media Style Sheets    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                          APPLICATION RUNTIME                           │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐ │
│  │ State Controller     │  │ Real-Time Validation │  │ 3D Mouse Tilt │ │
│  │ (Filtering, Sorting) │  │ (RFC Regex Engine)   │  │ Physics Engine│ │
│  └──────────────────────┘  └──────────────────────┘  └───────────────┘ │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────┐ │
│  │ Countdown Scheduler  │  │ Vanilla QR Engine    │  │ Canvas Confetti│ │
│  │ (1000ms loop)        │  │ (Galois Field GF256) │  │ Simulation    │ │
│  └──────────────────────┘  └──────────────────────┘  └───────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                          PERSISTENCE LAYER                             │
│       Browser LocalStorage API (`cp_events_v1`, `cp_passes_v1`)        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **State & Persistence Controller:** Manages reactive state across browser reloads via `localStorage`. Synchronizes booked seats, ticket inventories, and theme preferences.
2. **Interactive 3D Tilt Engine:** Calculates mouse vector displacements relative to card centroids in real-time, executing smooth multi-axis CSS rotation matrices (`rotateX`, `rotateY`, `translateZ`).
3. **Pure Vanilla QR Code Engine:** A self-contained QR matrix synthesis module implementing Galois Field $GF(2^8)$ arithmetic, Reed-Solomon error correction code polynomials, and standard mask evaluation rendered directly to an HTML5 `<canvas>`.
4. **Validation Subsystem:** Multi-stage client validation incorporating RFC-standard email verification, exact 10-digit telephone restrictions, alphanumeric ID matching, and email-event uniqueness enforcement.
5. **Print & Layout Subsystem:** Dedicated `@media print` directives that strip navigation, drawers, and ambient canvas backgrounds to output clean, single-page printable boarding passes.

---

## 3. Implementation Details

### A. 3D Card Hover & Interactive Parallax Physics
Every event card and the hero spotlight element implement 3D spatial transforms using CSS `preserve-3d` and variable depth planes:
- When a user moves their cursor over a card, the `mousemove` listener extracts bounding coordinates:
  $$\Delta X = \frac{x - \text{center}_x}{\text{center}_x}, \quad \Delta Y = \frac{y - \text{center}_y}{\text{center}_y}$$
- These normalized coordinates drive rotational angles up to $\pm 12^\circ$ along the orthogonal axes:
  $$\text{rotateX} = -\Delta Y \times \theta_{\max}, \quad \text{rotateY} = \Delta X \times \theta_{\max}$$
- Internal child elements (badges, headings, countdown chips, and action buttons) utilize progressive `transform: translateZ(...)` values (from `20px` to `50px`) creating true multi-layered optical parallax.
- On cursor departure (`mouseleave`), the card transitions back to neutral rest positions via spring-like timing functions.

### B. Pure Vanilla HTML5 Canvas QR Code Generator
Rather than importing heavy external barcode libraries, `app.js` encapsulates a mathematical implementation of the QR Code standard:
- **Galois Field $GF(256)$ Arithmetic:** Precomputes exponent and logarithm lookup tables modulo the irreducible primitive polynomial $x^8 + x^4 + x^3 + x^2 + 1$ (numeric decimal `285`).
- **Reed-Solomon Error Correction:** Dynamically constructs generator polynomials of degree 26 and computes remainder parity codewords over data streams.
- **Bit Stream Packaging:** Encodes alphanumeric and UTF-8 attendee identification payloads in 8-bit Byte Mode (`0100`), prepending character count indicators and appending standard padding sequences (`0xEC`, `0x11`).
- **Matrix Composition:** Positions $7\times 7$ finder patterns with separators, $5\times 5$ alignment patterns, alternating timing stripes, dark modules, and format information (Level M error correction with Mask Pattern 0).
- **Canvas Rendering:** Direct pixel rasterization onto the canvas context with high-contrast quiet zones.

### C. Rigorous Form Validation & Duplicate Prevention
The booking registration modal enforces data integrity before issuing any pass:
- **Full Name:** Validated via `/^[A-Za-z\s]{3,50}$/` to ensure alphabetical integrity and exclude numeric junk.
- **Email Address:** Strictly validated against the RFC email regex standard.
- **Phone Number:** Restricted to `/^\d{10}$/` for uniform 10-digit telephone numbering.
- **Institutional ID / Roll Number:** Alphanumeric constraint `/^[A-Za-z0-9\-_]{4,20}$/`.
- **Duplicate Prevention:** Iterates through stored ticket records in `localStorage`. If a matching email address already holds an active pass for that specific `eventId`, the transaction is blocked, displaying an inline validation error.
- **Seat Capacity Meter:** Dynamically computes capacity fill percentage:
  $$\text{Fill Percentage} = \min\left(100, \left\lfloor \frac{\text{bookedSeats}}{\text{totalSeats}} \times 100 \right\rfloor\right)$$
  Dynamically applies semantic color classes: Emerald for $<60\%$, Amber for $60\% - 85\%$, and Rose for $>85\%$.

### D. "My Passes" Slide-out Drawer & Capacity Restoration
- Booked passes are structured with unique sequential identifiers (`CP-XXXXXX`), timestamps, attendee metadata, and target venue data.
- The slide-out drawer provides instant retrieval with an inline search filter.
- Cancelling a booked pass prompts an intentional confirmation dialog, deletes the pass from `localStorage`, immediately decrements the event's `bookedSeats` counter by 1, and re-renders both the spotlight banner and catalog cards in real time.

### E. Theme Switcher & Accessibility
- The theme engine binds to the root document attribute `data-theme="dark|light"`.
- Uses custom properties for colors, elevation shadows, and backdrop blurs.
- Automatically initializes from `prefers-color-scheme` or the user's persisted `localStorage` choice.
- Accessible keyboard navigation allows searching via `Ctrl + K` or `/` and dismisses all open modals with `Escape`.

---

**Developed & Engineered by:** Devdatta Chaudhuri  
**Source Repository:** [https://github.com/devdattachaudhuri/eventmanage](https://github.com/devdattachaudhuri/eventmanage)
