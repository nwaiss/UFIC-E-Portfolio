# UFIC E-Portfolio — Cape Town Study Abroad

## Project Overview
Static website (HTML/CSS/JS only, no build tools, no frameworks) serving as an e-portfolio for a UFIC study abroad experience in Cape Town, South Africa. The trip was a computer science UX/UI program in which the student participated in building a chatbot for the Princess Vlei Forum.

## File Structure
```
/
├── index.html              ← Home page (overview + photos)
├── pictures.html           ← Photo wheel/carousel page
├── lessons-learned.html    ← Article-style lessons page
├── reflections.html        ← Article-style reflections page
├── css/
│   ├── main.css            ← Shared styles: header, footer, utilities, design tokens
│   ├── home.css            ← Home page: hero, overview, nav cards
│   ├── pictures.css        ← Photo wheel: wheel layout, animation, display panel
│   └── article.css         ← Article pages: typography, pull quotes, sections
├── js/
│   ├── main.js             ← Shared JS: nav active state, scroll effects
│   └── wheel.js            ← PhotoWheel class + photo data
└── Photos/                 ← All photos go here (JPEG)
```

## Design System
- **No gradients** — all color transitions use solid blocks
- **Palette:** Ocean navy (#1c3a5e), Mountain green (#2c5f4a), Sunset terracotta (#c24b2a), Sand (#d9cdb8), Cream (#f5f1eb)
- **Fonts:** Georgia/serif for headings, system-ui/sans for body
- **No external dependencies** — Google Fonts are included via CDN `<link>` tags only

## Content Status
- All body text is placeholder — replace via the `.overview-placeholder`, `.article-body` sections
- Home page photos: TBD (user will specify which Photos/ files to use)
- Wheel photos: all 17 Photos/ files are wired up with placeholder descriptions
- Application Walkthrough page: deferred, not yet built

## Photos Directory
Files in `/Photos/`: Amazon Skill Center.jpeg, Cannon.jpeg, Cooking Experience.jpeg, Final Presentation.jpeg, Garden.jpeg, Gold Bongo.jpeg, High School Experience.jpeg, Lionhead Aura.jpeg, Lionhead Base.jpeg, Lionhead Peak.jpeg, Princess Vlei Site.jpeg, Roommate.jpeg, Safari.jpeg, Seal Isalnd Boat.jpeg (sic), Table Mountain.jpeg, Taiwan Festical.jpeg (sic), Ziplinning African Massage.jpeg (sic)
