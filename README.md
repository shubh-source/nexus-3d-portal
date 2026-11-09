# NEXUS // 3D Interactive Spatial Login & Signup Experience

An ultra-modern, production-grade 3D interactive authentication experience built with **HTML5, CSS3 3D Spatial Transforms, Web Audio API, and Three.js (with an offline native Canvas 3D fallback)**.

![Status: Ready](https://img.shields.io/badge/Status-Production%20Ready-00dfd8)
![Responsive: 100%](https://img.shields.io/badge/Responsive-Mobile%20%7C%20Tablet%20%7C%20Desktop-7928ca)
![Accessibility: WCAG AA](https://img.shields.io/badge/A11y-WCAG%20AA%20Compliant-10b981)

---

## 🌟 Key Features

### 1. Spatial 3D Physics & Multi-Layer Depth
- **Interactive Mouse Tilt**: Real-time perspective calculation (`perspective(1200px) rotateX(...) rotateY(...)`) creates realistic tactile physics when moving your pointer over the card.
- **Specular Glare Tracking**: A dynamic radial light sheen glides across the glassmorphic surface following your cursor coordinates (`--mouse-x`, `--mouse-y`).
- **Mobile Gyroscope Support**: On mobile and tablet devices, physical device orientation angles (`deviceorientation`) tilt the card naturally as you tilt your phone.
- **Dimensional Z-Depth**: Form inputs (`translateZ(20px)`), buttons (`translateZ(30px)`), and mascot (`translateZ(45px)`) float on distinct spatial layers.
- **3D Card Flip**: Seamless dimensional 180° rotation between **Sign In** and **Sign Up** faces with spatial whoosh sound effects.

### 2. Expressive 3D Security Mascot ("Orb-E")
- **Cursor Tracking**: Mascot head, antenna, and digital visor track your pointer smoothly across the entire screen.
- **Password Shy State**: When entering the password field, Orb-E playfully covers its eyes with robotic hands and displays a speech bubble (*"I'm not looking! 🙈"*).
- **Password Peek Interaction**: When clicking the password visibility toggle (eye button), Orb-E lowers one hand and peeks with one curious eye (*"Just a peek! 👀"*).
- **Error Shake**: Shakes head in 3D (*"no-no"*) and flashes red distress eyes when validation errors occur.
- **Celebratory Success**: Jumps joyfully with smiling eyes (`^ ^`) and celebratory sound chimes upon successful authentication.

### 3. Three.js Spatial Background with Offline Fallback
- **Three.js WebGL Scene**:
  - Over 1,200 interactive star particles with subtle depth distribution.
  - Floating crystalline polyhedra (Icosahedron, Torus Knot, Octahedron, and Concentric Cyber Rings) with metallic and wireframe materials.
  - Real-time cursor-tracked point light casting dynamic specular highlights on 3D geometry as your mouse moves.
- **Resilient Offline Fallback**:
  - If internet is unavailable or CDN is blocked, `fallback-3d.js` automatically activates with a pure mathematical 3D perspective projection engine.

### 4. Interactive Web Audio UI Synthesizer
- Uses the native browser **Web Audio API** (zero external MP3/WAV files required).
- Generates procedural sound effects for:
  - Button hover & toggle ticks
  - Form typing digital blips
  - 3D card flip whoosh sweep
  - Validation error chords
  - Ascending victory triad chime (C5-E5-G5-C6)
- Sound mute toggle with preference saved to `localStorage`.

### 5. Multi-Theme Switching
- **Cosmic Neon** (Default: Violet, Cyan & Hot Pink)
- **Cyber Emerald** (Matrix Green, Mint & Jade)
- **Sunset Flare** (Rose, Orange & Amber Gold)
- **Midnight Shadow** (Deep Space Blue & Slate)

### 6. Accessibility & Form Validation
- Keyboard navigation (<kbd>Tab</kbd>, <kbd>Enter</kbd>, <kbd>Esc</kbd> to close modals).
- Password strength evaluation engine (Length, Uppercase, Numbers, Special characters) with visual 4-tier progress bar and criteria checklist.
- Password visibility toggles with SVG morphing and ARIA announcements.
- Forgot Password modal with asynchronous dispatch simulation.
- `prefers-reduced-motion` media query compliance for users sensitive to motion.

---

## 🚀 Quick Start

### Option A: Open directly in your browser
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari, Brave).

### Option B: Run via Local Development Server
With **Python**:
```bash
python -m http.server 3000
```
Then open `http://localhost:3000` in your browser.

With **Node.js**:
```bash
npm run serve
```
Then open `http://localhost:3000`.

---

## 📁 File Structure

```text
├── index.html          # Semantic HTML5 markup, ARIA labels, 3D rig containers
├── package.json        # Project metadata and quick-start scripts
├── README.md           # Documentation and guide
├── css/
│   └── style.css       # Complete design system, 3D CSS transforms, glassmorphism, responsive queries
└── js/
    ├── app.js          # Core controller: 3D parallax, flip transitions, validation, modals
    ├── audio.js        # Web Audio API procedural sound synthesizer
    ├── mascot-3d.js    # Interactive 3D robot mascot controller & canvas renderer
    ├── three-scene.js  # Three.js 3D background, floating polyhedra & cursor light
    └── fallback-3d.js  # Pure HTML5 Canvas 3D projection engine (offline fallback)
```

---

## 🎨 Customization Guide

- **Adjust 3D Tilt Intensity**: In `js/app.js`, edit `const maxTilt = 14;` (e.g., set to `20` for stronger tilt, or `8` for subtle effect).
- **Customize Theme Colors**: In `css/style.css`, modify the `:root` and `[data-theme="..."]` color variables.
- **Adjust Mascot Speech**: In `js/mascot-3d.js`, customize the messages in `mascot.setState(...)`.
