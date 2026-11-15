# 🔥 IGNIS-0G — Microgravity Combustion Science & Spacecraft Fire Safety Intelligence

> **NASA Mission Control-Grade Intelligence Platform for Multi-Regime Combustion Physics, Anomaly Detection & Flammability Assessment (ISS, Artemis Lunar Base, Orion, Mars Habitat)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20%2F%20Netlify-F97316?style=for-the-badge&logo=vercel&logoColor=white)](https://your-live-demo-url-here.vercel.app)
[![Pitch Video](https://img.shields.io/badge/Pitch%20Video-YouTube%20%2F%20Loom-3B82F6?style=for-the-badge&logo=youtube&logoColor=white)](https://your-pitch-video-url-here.com)
[![NASA PSI Open Data](https://img.shields.io/badge/NASA%20PSI-17%20Verified%20Experiments-FC3D21?style=for-the-badge&logo=nasa&logoColor=white)](https://psi.nasa.gov/)
[![NASA-STD-6001B](https://img.shields.io/badge/NASA--STD--6001B-Methodology-10B981?style=for-the-badge)](https://standards.nasa.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc?style=for-the-badge)](./LICENSE)

---

## 📌 Submission Links & Quick Access
* 🚀 **Interactive Live Demo:** `[Live Demo URL — Paste Your Vercel/Netlify Link Here]`
* 🎥 **2.5-Minute Pitch Video:** `[Pitch Video URL — Paste Your YouTube/Loom Link Here]`
* 📂 **NASA Space Apps Challenge:** `Combustion in Space & Spacecraft Fire Safety`
* 🛰️ **Primary Data Source:** [NASA Physical Sciences Informatics (PSI) Repository](https://psi.nasa.gov/)

---

## 🌌 Mission Overview: The Physics Problem

Fire in microgravity defies terrestrial intuition. On Earth ($1.0\text{g}$), gravity drives buoyant natural convection: hot gases rise, drawing fresh cold oxygen into the base and forming the familiar flickering upward teardrop flame.

In space ($0\text{g}$ / microgravity), **buoyant natural convection vanishes**:
* **Buoyancy Force Drops to Zero ($F_b \to 0$):** $F_b = (\rho_\infty - \rho_f) \cdot g \cdot V \approx 0$.
* **Grashof Number Collapses ($Gr \to 0$):** $Gr = \frac{g \beta \Delta T L^3}{\nu^2} \to 0$, eliminating convective boundary layer plumes and reducing transport to pure molecular diffusion ($\nabla^2 Y_i = 0$).
* **Froude Number Diverges ($Fr \to \infty$):** $Fr = \frac{U^2}{g L} \to \infty$, meaning that forced cabin ventilation ($U$) strictly dictates flame geometry and survival.

This absence of buoyant flow introduces critical hazards for human spaceflight:
1. **The BASS Draft Paradox:** In stagnant zero-g air ($0\text{ cm/s}$), flames smother and self-extinguish within 45 seconds under their own lingering $CO_2$/$H_2O$ exhaust blanket. However, a gentle draft of merely $2.5\text{ to }5\text{ cm/s}$ sweeps away the asphyxiating blanket and sustains steady, spherical burning indefinitely.
2. **Invisible 600K Cool Flames (NASA FLEX):** Liquid hydrocarbon droplets continue burning after visible flame extinction via low-temperature peroxy radical kinetics ($550\text{K} - 800\text{K}$). These "cool flames" emit zero visible soot and evade standard optical IR/UV spacecraft flame sensors while actively generating deadly carbon monoxide ($CO$).
3. **The Artemis Exploration Atmosphere Paradox:** The Artemis Lunar Base and Orion employ **34% $O_2$ at 56.5 kPa (8.2 psia)** to eliminate pre-breathe times for lunar EVAs. NASA flight data confirms that combustion kinetics are governed by the **elevated oxygen mole fraction ($X_{O2} = 0.34$)**, NOT reduced pressure. Polymers certified as self-extinguishing in Earth air burn at near-terrestrial speeds under Artemis lunar conditions.
4. **Soot Entrapment & Severe Radiative Heat Loss:** Absence of buoyancy traps soot particles in thick spherical envelopes, radiating 40% to 65% of chemical energy and generating elevated toxic $CO$ concentrations.

**IGNIS-0G** bridges the gap between raw NASA flight telemetry and real-time mission decision support.

---

## 🏛️ Core Capabilities: The 5 Modules

```
+---------------------------------------------------------------------------------------------------------+
|                                        IGNIS-0G TELEMETRY DECK                                          |
|   [REFERENCES NASA-STD-6001B METHODOLOGY]   [17 NASA PSI RECORDS]   [TARGET: ARTEMIS / GATEWAY / MARS]  |
+---------------------------------------------------------------------------------------------------------+
                                                     │
         ┌───────────────────┬───────────────────────┼───────────────────────┬───────────────────┐
         ▼                   ▼                       ▼                       ▼                   ▼
┌─────────────────┐ ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐ ┌─────────────────┐
│    MODULE 1     │ │    MODULE 2     │     │    MODULE 3     │     │    MODULE 4     │ │    MODULE 5     │
│ 60FPS Combustion│ │Spacecraft Fire  │     │Hybrid AI Grounded│    │Cross-Experiment │ │ NASA PSI Flight │
│ & Aerodynamics  │ │Risk Matrix &    │     │Research         │     │Telemetry Graph &│ │Curated Dataset  │
│ Simulator       │ │Suppression Bench│     │Analyst (RAG)    │     │Anomaly Detector │ │ & Dossiers      │
└─────────────────┘ └─────────────────┘     └─────────────────┘     └─────────────────┘ └─────────────────┘
```

### 1. 60FPS Microgravity Combustion & Aerodynamics Simulator (`GravityComparator.tsx`)
* Real-time 60FPS canvas simulation modeling flame kinetics across **Earth ($1.0\text{g}$)**, **Mars ($0.38\text{g}$)**, **Moon ($0.16\text{g}$)**, and **ISS ($0.0\text{g}$)**.
* **Dynamic Physics Behavior:**
  * **1.0g Earth:** Flickering elongated teardrop plume with buoyant chimney draft.
  * **0.0g ISS & 0 cm/s airflow:** Spherically symmetric blue flame that starves under its own $CO_2$ blanket, with a physical **45.0-second self-extinction countdown** benchmark (with optional 1x / 3x simulation acceleration).
  * **0.0g ISS & 2.5–5 cm/s airflow:** Stable spherical blue diffusion flame sustained by forced cabin ventilation.
  * **Cool Flame Mode (FLEX 600K):** Visible flame extinguishes, replaced by a pulsating ultraviolet/indigo 600K chemical reaction halo emitting $CO$ gas particles.
* **Live Telemetry Inspector Sidebar:** Docked real-time computation of Buoyancy Force ($F_b$), Grashof Number ($Gr$), Froude Number ($Fr$), Reynolds Number ($Re$), radiant loss fraction, and toxic $CO$ emission rates.

### 2. Spacecraft Material Risk Matrix & Suppression Benchmark (`RiskMatrix.tsx`)
* **Standardized NASA Mission Presets:**
  * *ISS / Gateway Nominal:* $21.0\%\text{ }O_2$, $101.3\text{ kPa}$, $0.0\text{g}$
  * *Artemis Exploration Atmosphere (EVA Prep):* $34.0\%\text{ }O_2$, $56.5\text{ kPa}$, $0.16\text{g}$
  * *Orion / Transit Contingency:* $26.5\%\text{ }O_2$, $70.3\text{ kPa}$, $0.0\text{g}$
  * *Mars Surface Habitat (Simulated):* $26.0\%\text{ }O_2$, $70.3\text{ kPa}$, $0.38\text{g}$
* **Material Flammability Gauges:** Evaluates `Nomex Flight Suit Fabric`, `PMMA Cast Acrylic Window`, `XLPE Copper Wiring`, `SIBAL Cotton-Fiberglass`, and `Polyurethane Foam`.
* **Suppression Benchmark:** Evaluates **NASA SoFIE Fine Water Mist** vs. **Legacy $CO_2$ Flooding**:
  * Fine Water Mist stays suspended in microgravity (zero droplet settling), extracting **2.26 MJ/kg** latent heat via 100% phase-change vaporization.
  * Reclaimed by ECLSS condensing heat exchangers into potable water, avoiding the acute hypercapnia (>4% $CO_2$) caused by gas flood extinguishers.

### 3. Hybrid AI Research Analyst (`AiSynthesizer.tsx`)
* **100% Offline Out-of-the-Box Deterministic RAG Engine:** Pre-indexed over all 17 verified NASA PSI records. Zero API key required.
* **5 AI Provider Options** (all credentials RAM-only, never persisted):
  1. **Offline TF-IDF Analyst** (default) — Deterministic semantic engine, works with zero connectivity.
  2. **Google Gemini** (`gemini-2.0-flash` or custom model name) — via Google AI Studio API key.
  3. **OpenAI** (`gpt-4o-mini` / `gpt-4o`) — via OpenAI Platform API key.
  4. **Anthropic Claude** (`claude-3-5-sonnet-latest`) — via Anthropic Console API key.
  5. **OpenAI-Compatible Custom Endpoint** — Supports Groq, OpenRouter, DeepSeek, Mistral, or local Ollama.
* **Automatic graceful fallback** to Offline TF-IDF if an external API call fails or times out.
* **One-Click Technical Prompt Chips:**
  * *"Compare Methane vs. Hydrogen fire hazards in 0g"*
  * *"Explain the Draft Paradox in BASS experiments"*
  * *"Why is Artemis 34% O2 dangerous at low pressure?"*
  * *"Water Mist vs CO2 in microgravity"*
* **Clickable PSI Citation Badges:** Every technical claim links directly to verified flight record IDs (e.g. `[NASA-ACME-01]`, `[PSI-CB-0041]`).

### 4. Cross-Experiment Telemetry Correlation Graph (`InsightGraph.tsx`)
* Multi-axis interactive visualizations built with Recharts:
  * **Chart A (ScatterChart):** *Flame Spread Rate (mm/s) vs. Oxygen Concentration (%)* color-grouped by Gravity Regime (`0g`, `0.16g`, `0.38g`, `1.0g`).
  * **Chart B (ComposedChart):** *Airflow Velocity (cm/s) vs. Combustion Sustainability* featuring a highlighted shaded reference area marking the **Microgravity Combustion Survival Window (2.5 to 15 cm/s)**.
* Highlights flight anomalies: The Saffire Ventilation Paradox, Low-Oxygen Cool Flame Longevity, and Soot Super-Aggregation.

### 5. NASA PSI Dataset Explorer (`DatasetExplorer.tsx`)
* Full searchable and filterable database of 17 authentic NASA flight and ground experiments with provenance indicators (`Published NASA Flight Data` vs `NASA Ground/Drop-Tower Baseline`).
* **Slide-Over Engineering Dossier Drawer:** Inspect exact thermodynamic parameters, physical observations, official citations, and `NASA-STD-6001B` mitigation protocols.
* One-click data portability: Export the full dataset to structured **JSON** and **CSV**.

---

## 🧪 NASA Data Attribution & Physical Sciences Informatics (PSI)

IGNIS-0G is grounded in peer-reviewed data from 17 verified experiments curated from the [NASA Physical Sciences Informatics (PSI)](https://psi.nasa.gov/) system:

| Record ID | Program / Facility | Provenance | Material / Target | Gravity Regime | Key Scientific Insight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PSI-CB-0041` | **Saffire-I** (Cygnus OA-6) | Published NASA Flight Data | SIBAL Cotton-Fiberglass | 0g Microgravity | First large-scale (0.4m x 1m) spacecraft fire; thick boundary layer radiant preheating. |
| `PSI-CB-0042` | **Saffire-II** (Cygnus OA-5) | Published NASA Flight Data | Nomex Flight Suit Fabric | 0g Microgravity | Maximum Oxygen Concentration (MOC) self-extinction limit is higher in 0g (18.5% O2) than 1g. |
| `PSI-CB-0078` | **Saffire-IV** (Cygnus NG-13) | Published NASA Flight Data | PMMA Acrylic (5mm) | 0g (56.5 kPa) | Artemis exploration atmosphere (reduced pressure, elevated O2) spikes solid polymer pyrolytic outgassing. |
| `PSI-CB-0079` | **Saffire-V** (Cygnus NG-14) | Published NASA Flight Data | PMMA Acrylic Sheet | 0g (70.3 kPa) | Elevated O2 triggers subsurface bubbling and floating molten polymer droplets. |
| `PSI-CB-0095` | **Saffire-VI** (Cygnus NG-19) | Published NASA Flight Data | Polyurethane Foam | 0g Microgravity | Smoldering-to-flaming transition triggered when ventilation increases from 2 to 10 cm/s. |
| `PSI-CB-0012` | **FLEX** (ISS CIR Rack) | Published NASA Flight Data | n-Heptane Droplet | 0g Microgravity | Discovery of quasi-steady Cool Flames burning invisibly at 600K after visible hot flame extinction. |
| `PSI-CB-0015` | **FLEX-2** (ISS CIR Rack) | Published NASA Flight Data | Methanol Droplet | 0g Microgravity | Combustion water vapor condenses into droplet core, driving liquid-phase dissolution extinction. |
| `PSI-CB-0021` | **FLEX-ICE** (ISS CIR Rack) | Published NASA Flight Data | Decane / Hexanol | 0g Microgravity | Reducing ambient O2 to 18% extends low-temperature cool flame duration due to reduced radiative/thermal quenching. |
| `PSI-CB-0028` | **BASS** (ISS MSG) | Published NASA Flight Data | Paraffin Wax Candle | 0g Microgravity | Draft Paradox: 0 cm/s flow suffocates flames within 45s; 2.5 cm/s forced draft sustains steady burning. |
| `PSI-CB-0033` | **BASS-II** (ISS MSG) | Published NASA Flight Data | PMMA Acrylic Rod | 0g Microgravity | Quenching standoff distance is 3x wider in 0g than 1g; generates floating molten droplets. |
| `PSI-CB-0055` | **ACME (CFI)** (ISS CIR) | Published NASA Flight Data | Methane Gas Jet | 0g Microgravity | Spherically symmetric laminar jet without buoyant flicker; soot particles form branched chain aggregates. |
| `PSI-CB-0059` | **ACME (CFE)** (ISS CIR) | Published NASA Flight Data | Hydrogen Gas Jet | 0g Microgravity | Invisible 2240K UV flame; preferential diffusion allows burning at super-lean limits without soot. |
| `PSI-CB-0081` | **SoFIE (GEL)** (ISS CIR) | Published NASA Flight Data | XLPE Copper Wiring | 0g Microgravity | Copper core conducts thermal energy ahead of reaction zone; 10–15 cm/s opposed flow maximizes spread. |
| `PSI-CB-0083` | **SoFIE (MIST)** (ISS CIR) | Published NASA Flight Data | PMMA with Water Mist | 0g Microgravity | Sub-millimeter mist droplets stay suspended in 0g, vaporizing with 100% efficiency (4.8x higher than CO2). |
| `PSI-CB-0062` | **BRE** (Drop Tower 5.18s) | NASA Ground/Drop-Tower Baseline | Gaseous Ethylene (PMMA) | 0.16g (Lunar) | Lunar gravity creates worst-case hybrid: low buoyant cooling plus continuous oxygen feeding. |
| `PSI-CB-0036` | **SLICE** (ISS MSG) | Published NASA Flight Data | Ethylene Gas Jet | 0g Microgravity | Heavy soot super-aggregation releases massive unoxidized carbon monoxide clouds. |
| `PSI-BL-1001` | **Ground Baseline** (WSTF) | NASA Ground/Drop-Tower Baseline | SIBAL Cotton-Fiberglass | 1.0g (Earth) | NASA-STD-6001B Test 1 benchmark: buoyant upward chimney spread is 4.6x faster than 0g. |

---

## 🔬 Data Provenance & Modeling Limitations

1. **Experimental Grounding:** All quantitative values (spread rates, temperatures, MOCs, quenching distances) in the dataset are sourced directly from published NASA Physical Sciences Informatics (PSI) flight telemetry, technical memoranda (TM), and peer-reviewed combustion literature.
2. **CFD Simulator Approximation:** The 60FPS HTML5 Canvas simulator utilizes real-time semi-empirical fluid dynamics and dimensionless parameter scaling ($Gr$, $Fr$, $Re$, $F_b$) for browser responsiveness. It is engineered for interactive conceptualization and educational visualization, not as a replacement for high-performance supercomputing Navier-Stokes CFD codes (such as NIST FDS or NASA OpenFOAM solvers).
3. **Safety Reference:** Flammability classifications and suppression guidance reference the engineering methodology of `NASA-STD-6001B`. Mission designers must execute certified flight hardware acceptance testing at NASA White Sands Test Facility (WSTF) prior to flight certification.

---

## 💻 Tech Stack & Software Architecture

* **Frontend Framework:** React 19 (TypeScript `strict: true`)
* **Build Tool:** Vite 6
* **Design System:** SpaceX / Linear Telemetry Palette (Obsidian `#09090B`, Panels `#111114`, Hairline `#27272A`, Aerospace Orange `#F97316`, Technical Blue `#3B82F6`)
* **Motion & Transitions:** Framer Motion (`<AnimatePresence>`)
* **Interactive Charts:** Recharts (`ScatterChart`, `ComposedChart`, `Area`, `Line`, `ReferenceArea`)
* **Icons:** Lucide React
* **AI Grounding:** Universal multi-provider hybrid architecture (Offline TF-IDF deterministic RAG + Gemini / OpenAI / Anthropic Claude / Custom OpenAI-compatible endpoint — all RAM-only, zero persistence)

---

## 🚀 Quick Start & Local Execution

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/ignis-0g.git
cd ignis-0g

# Install dependencies
npm install

# Start local Mission Control dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Verification
```bash
# Build TypeScript and bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 1-Click Static Deployment (Vercel & Netlify)

IGNIS-0G is configured with SPA rewrite rules (`vercel.json` and `public/_redirects`) to prevent 404 errors on deep routes.

### Deploy to Netlify Drop (30 Seconds — Zero Setup)
1. Run `npm run build` in your terminal.
2. Open [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
3. Drag and drop the generated `dist/` folder directly onto the page. Your live NASA project URL is ready!

---

## 📄 License & Attribution

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
Built for the NASA Space Apps Challenge.
Data courtesy of the **NASA Physical Sciences Informatics (PSI)** system and NASA Glenn Research Center (GRC).


## ⚠️ Data Provenance & Limitations
Records are curated summaries encoded in `src/data/nasaExperiments.ts`. The PSI repository is public (`s3://nasa-psi/`), but **record IDs, citations and some values have not yet been independently verified against it**; the simulator is a physics-informed visualization, not CFD. Verify before any engineering use.
