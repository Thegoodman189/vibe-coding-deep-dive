# Design Document - PlantsVsMiku's

## 1. Tech Stack

### Frontend
- **HTML5** - Structuur en semantic markup
- **CSS3** - Styling, responsive design, animations
- **JavaScript (ES6+)** - Core game logic en interactie

### Game Framework
- **Phaser 3** - 2D game engine voor canvas rendering, input handling, animations, en physics
  - Waarom: Lightweight, perfect voor grid-based strategy games, goede community support

### Build & Development
- **Vite** (optioneel) - Snelle development server en bundling
- **Node.js** - Local development environment

### Additional Libraries
- Geen externe dependencies voor MVP - alles built-in in Phaser

---

## 2. Globale Architectuur

### File Structure
```
PlantsVsMiku's/
├── index.html          (Main Menu)
├── game.html           (Game Scene)
├── settings.html       (Settings/Options)
├── css/
│   ├── main.css        (Global styles)
│   ├── menu.css        (Menu styling)
│   └── game.css        (Game UI styling)
├── js/
│   ├── main.js         (Entry point & initialization)
│   ├── scenes/
│   │   ├── MenuScene.js
│   │   ├── GameScene.js
│   │   ├── GameOverScene.js
│   │   └── SettingsScene.js
│   ├── entities/
│   │   ├── Plant.js
│   │   ├── Miku.js
│   │   ├── PowerUp.js
│   │   └── Enemy.js
│   ├── managers/
│   │   ├── ResourceManager.js
│   │   ├── LevelManager.js
│   │   └── AudioManager.js
│   ├── utils/
│   │   ├── GridUtils.js
│   │   └── Constants.js
│   └── config.js       (Game config)
└── assets/
    ├── images/
    ├── audio/
    └── data/
        └── levels.json
```

### Architecture Pattern
- **Scene-based**: Phaser Scenes voor Menu, Game, Settings, GameOver
- **Entity-Component**: Game objects (Plants, Miku's) met properties en methods
- **Manager Pattern**: Resource, Level, Audio managers für centraliseerde state

---

## 3. Belangrijke Keuzes

### Game Framework: Phaser 3
- ✅ Ingebouwde canvas rendering (geen manual canvas API nodig)
- ✅ Input handling (mouse, touch) built-in
- ✅ Physics engine voor collision detection
- ✅ Animation system voor character movements
- ✅ Audio management système
- ✅ Scene management (eenvoudig switchen tussen menu/game/settings)

### Grid-Based System
- Grid size: 8x6 tiles (aanpasbaar per level)
- Tile-based character placement met einduidig coördinaat systeem
- Collision detection op grid basis

### Resource System
- Centraal ResourceManager voor energie/zon management
- Turn-based resource generation
- Real-time feedback in HUD

### Data-Driven Levels
- Levels stored in JSON format (assets/data/levels.json)
- Makkelijk uitbreidbaar voor toekomstige levels
- Level-specifieke settings (difficulty, enemy count, starting resources)

---

## 4. Bekende Risico's

### Technisch

| Risico | Waarschijnlijkheid | Impact | Mitigatie |
|--------|-------------------|--------|-----------|
| **Performanceproblemen bij veel entities** | Gemiddeld | Medium | Object pooling, efficient rendering, profiling |
| **Cross-browser compatibility** | Laag | Medium | Testing op Chrome, Firefox, Safari; Phaser handles veel ervan |
| **Audio synchronisatie** | Gemiddeld | Laag | Pre-load audio, test met verschillende devices |
| **Mobile responsiveness** | Gemiddeld | Medium | CSS media queries, touch event handling in Phaser |

### Design & Content

| Risico | Waarschijnlijkheid | Impact | Mitigatie |
|--------|-------------------|--------|-----------|
| **Scope creep (meer dan 5 levels)** | Hoog | Hoog | Strict definition van MVP, duidelijke in/out of scope |
| **Balancing multiplayer is lastig** | N/A | N/A | Afwezig in MVP, future scope |
| **Music integration complexity** | Laag | Medium | Start met eenvoudige sound effects, expansie later |

### Timeline

| Risico | Waarschijnlijkheid | Impact | Mitigatie |
|--------|-------------------|--------|-----------|
| **Underestimating development time** | Gemiddeld | Hoog | Incremental development, frequent playtesting |
| **Asset creation (art/audio)** | Gemiddeld | Medium | Simplified art style, royalty-free audio, focus op gameplay |

---

## 5. Development Roadmap (Fases)

### Fase 1: Foundation (Wednesday Morning)
- Phaser setup & basic scene structure
- Menu scene (index.html)
- Game scene skeleton
- Basic styling (main.css, menu.css)

### Fase 2: Core Gameplay (Wednesday Afternoon - Thursday Morning)
- Grid system en placement mechanic
- Plant & Miku entity classes
- Basic combat system
- ResourceManager implementation
- Level 1 & 2 creation

### Fase 3: Systems & Content (Thursday Afternoon)
- Levels 3, 4, 5 met progressive difficulty
- Win/lose conditions & game flow
- Settings menu (settings.html)
- HUD & UI improvements
- Audio integration (basic sound effects)
- Testing & balancing

### Fase 4: Presentation Ready (Friday)
- Bug fixes & polish
- Final testing & playtesting
- Documentation & code cleanup
- Prepare presentation materials
- Demo preparation