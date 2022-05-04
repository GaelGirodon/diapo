# Diapo

A simple, lightweight (~ 3 kB _gzipped_) and modern (ECMAScript 2020)
presentation tool powered by web technologies, featuring:

- Presenter mode with index, timer, notes and cloned view
- Slide auto-scaling to preserve appearance
- Overview mode and black screen
- Various navigation controls

## Usage

### Quickstart

- Create a <abbr title="e.g., see Bootstrap or Bulma starter HTML templates">
  standard</abbr> HTML 5 file
- Import `diapo.min.js` and `diapo.min.css`
- Create slides: `body.diaporama>.diapos>.diapo*n`
- Add speaker notes: `.diapo>.notes` (_optional_)
- Initialize the slideshow:

```js
const diapo = new Diapo();
```

### Controls

| ⌨️ Key / 🖱️ Wheel                                               | Description                                |
| ------------------------------------------------------------- | ------------------------------------------ |
| <kbd>→</kbd> <kbd>↓</kbd> <kbd>PgDn</kbd> <kbd>Space</kbd> 🖱️↓ | Navigate to the next slide                 |
| <kbd>←</kbd> <kbd>↑</kbd> <kbd>PgUp</kbd> 🖱️↑                  | Navigate to the previous slide             |
| <kbd>Home</kbd>                                               | Navigate to the first slide                |
| <kbd>End</kbd>                                                | Navigate to the last slide                 |
| <kbd>O</kbd>                                                  | Toggle the overview mode                   |
| <kbd>P</kbd>                                                  | Toggle the presentation mode               |
| <kbd>C</kbd>                                                  | Open the clone view (in presentation mode) |
| <kbd>Esc</kbd> <kbd>Enter</kbd>                               | Return to the default mode                 |
| <kbd>B</kbd>                                                  | Toggle the black screen (in default mode)  |
| <kbd>T</kbd>                                                  | Reset the timer                            |

### Formatting

The following CSS classes are provided by default and can be used on `div.diapo`
elements:

- Vertical content alignment: ⬆️ `top` (_default_), ↕️ `middle`, ⬇️ `bottom`
- Horizontal text alignment: ⬅️ `left`, ↔️ `center`, ➡️ `right`
- Slide themes: ☀️ `light` (_default_), 🌑 `dark`
- Columns layout: `.row>.col*n`

## API

### Navigation

Navigate to a slide (`"prev"`, `"next"`, `"first"`, `"last"` or a zero-indexed
slide number):

```js
diapo.navigate("next")
```

### Mode

Toggle a mode (`"overview"`, `"presenter"` or `"show"` = _default_):

```js
diapo.toggleMode("presenter")
```

### Clone

Open the detached view, controlled from the presenter mode:

```js
diapo.openClone()
```

### Black screen

Toggle the black screen:

```js
diapo.toggleBlackScreen()
```

### Events

Subscribe to events:

```js
diapo.on("navigationEnd", (e) => console.log(`Navigated to ${e.index}`))
```

| Name              | Arguments (`e`)    | Description                  |
| ----------------- | ------------------ | ---------------------------- |
| `navigationStart` | `{index, element}` | Before navigating to a slide |
| `navigationEnd`   | `{index, element}` | After navigating to a slide  |
| `modeToggle`      | `{mode}`           | After changing mode          |
| `cloneOpen`       | `{window}`         | After opening the clone view |

## License

**Diapo** is licensed under the MIT License.
