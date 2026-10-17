# Krutik Vastu Art Finder

A luxury Vedic art curation web application designed and generated with **Stitch MCP Server** (`projects/17988357986764769809`).

## Overview

**Krutik Vastu Art Finder** harmonizes contemporary living and executive spaces with the sacred geometric principles of the **Vastu Purusha Mandala**, **Manasara**, and **Mayamata** ancient treatises.

Through an interactive discovery workflow, users calibrate their rooms, cardinal directions, personal intentions, and aesthetic traditions (Pichwai, Tanjore, Sri Yantra, Celestial Horses) to reveal consecrated masterworks tailored with 99%+ energetic resonance.

---

## Key Features

1. **Cinematic Hero & Sacred Vastu Chakra Stage**:
   - Double counter-rotating Vedic Chakra geometry with 36 compass ticks, 8 directional deities (*Kubera, Ishanya, Surya, Agni, Yama, Nirruti, Varuna, Vayu*), interlocking squares, 16-petal lotus, and central bindu.
   - Ambient gold stardust particle field with float animations.

2. **Personalized 5-Step Vastu Questionnaire**:
   - **Step 1: Intention Alignment** (9 Vedic intentions: Prosperity, Career, Vitality, Peace, Spiritual, etc.).
   - **Step 2: Room Placement Alignment** (8 sanctuary rooms: Living, Office, Mandir, Bedroom, etc.).
   - **Step 3: Wall Orientation & 8-Direction Compass** (Interactive 8-cardinal axis calibration).
   - **Step 4: Aesthetic Style & Color Harmony** (Pichwai, Tanjore, Yantras + 5 elemental palettes).
   - **Step 5: Spiritual & Philosophical Orientation** (Deific Consecrated vs Non-Religious Sacred Geometry).
   - **Step 6: Final Sanctuary Notes** (Space details, dimensions, quick tags).
   - **Dynamic Right-Side Live Preview**: Instant live feedback showing selected direction, deity, room, and calibrated artwork preview.

3. **Calibrated Curation Reveal (Results Screen)**:
   - Personalized Sanctuary Report (Folio #VT-8802).
   - Dynamic 99%+ Resonance Score.
   - Primary Masterpiece spotlight with provenance, artisan hours, and 24K gold foil specifications.
   - **Spatial Vastu Prescription**: Hanging elevation (5.5 ft center), lighting temp (2700K spotlight), and auspicious installation Muhurat.
   - **Pancha Bhoota (5 Elements) Distribution**: Dynamic balance bars for *Prithvi, Agni, Vayu, Jala, Akasha*.
   - **Harmonic Counterparts**: 3 curated pairing recommendations for balancing adjacent cardinal axes.

4. **Interactive 3D Space & Augmented Reality (AR) Simulator**:
   - Simulated architectural room with limestone wall, herringbone floor, floating teak credenza, and brass urli vessel.
   - **3 Lighting Modes**: Brahma Muhurta (Dawn 6 AM), Surya Crest (Midday), Sandhya (Dusk).
   - **Live Elevation Slider**: Adjust mounting height from 4.5 ft to 6.5 ft with live visual translation.
   - **Moulding Switcher**: Burma Teak, Gold Foil, or Obsidian float frame.
   - **Vastu Grid Overlay**: 3×3 Vedic grid projection on wall.
   - **Mobile LiDAR / AR Mode**: 1:1 scale AR QuickLook/WebXR projection.

5. **Royal Collection Gallery & 8-Direction Encyclopedia**:
   - Complete catalog with direction, room, and style filters.
   - Interactive Vastu direction guide explaining deities, planets, elements, and prescribed art.

6. **Vedic 432Hz Ambient Soundscape**:
   - Synthesized live with the Web Audio API (Tanpura drone + 432Hz / 528Hz bell chime), completely offline without external audio files.

---

## Quick Start

### Running with Node.js
```bash
npm start
```
Or:
```bash
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

Alternatively, double-click or open `index.html` directly in any modern browser.

---

## Project Structure

```
d:\Vastu Artfinder\
├── index.html            # Main Single-Page Application
├── css/
│   └── styles.css        # Sacred geometry animations, lighting presets & styles
├── js/
│   ├── app.js            # Core interactive logic, stepper, 3D AR simulator
│   ├── data.js           # Artworks, directions, intentions, rooms, shastra quotes
│   └── audio.js          # Web Audio API 432Hz Vedic drone & chime generator
├── stitch_raw/           # Original generated Stitch HTML screens
├── server.js             # Lightweight Node static server
├── package.json          # Project configuration & npm start script
└── README.md             # Documentation
```
