# For Ilhem — A Blooming Purple ASCII Gift

An interactive HTML, CSS, and JavaScript ASCII animation gift featuring `"ilhem"` zooming smoothly into a botanical leaf, growing into a bouquet of purple-dominant flowers in a ribbon-tied crystal vase surrounded by 6 animated kitties, gentle Web Audio music-box chimes, and a personal love note.

## Project Structure

```text
ilhem-ascii-gift/
├── index.html      # Page markup (gift intro screen, canvas stage, love note modal, HUD)
├── css/
│   └── style.css   # Purple theme, frosted-glass cards, responsive HUD styling
├── js/
│   ├── config.js   # GIFT_CONFIG (personalize text here) + math/easing & color helpers
│   ├── audio.js    # Web Audio API music-box chime synthesizer & timeline cues
│   ├── art.js      # ASCII art data ("ilhem", leaf, vase, 18 flowers, butterflies)
│   ├── cats.js     # Animated ASCII cat templates & pet-to-purr interaction
│   └── main.js     # Camera choreography, canvas render loop & UI event bindings
└── README.md
```

## Personalize the Note

Edit `GIFT_CONFIG` at the top of `js/config.js` to customize the title, subtitle, love note, and signature.

## Publish Free on GitHub Pages

1. Create a new **Public** repository on GitHub (e.g. `for-ilhem`).
2. Upload the entire contents of this folder (`index.html`, `README.md`, `css/`, and `js/`).
3. Go to **Settings → Pages** → **Deploy from a branch** → choose `main` and `/ (root)`, then **Save**.
4. Your live website will be ready at `https://<your-username>.github.io/for-ilhem/`.
