/*
 * main.js
 */

/**
 * A presentation framework using web technologies
 */
class Diapo {

  /**
   * Attach the slideshow behavior to the given container element.
   * @param {HTMLElement?} element Slideshow main container element
   */
  constructor(element) {
    // Setup DOM
    this._prepare(element);

    /** Event listeners */
    this._listeners = {};
    /** Index of the current slide */
    this._current = 0;
    /** Display mode */
    this._mode = "show";
    /** Timer start value */
    this._startTime = null;

    if (new URLSearchParams(location.search.slice(1)).has("clone")) {
      // Slideshow is controlled remotely
      window.$diapo = this;
    } else {
      // Handle key down events
      document.addEventListener("keydown", (e) => this._handleKeyDown(e));
      // Handle mouse wheel event
      document.addEventListener("wheel", (e) =>
        this.navigate(this._current + (e.deltaY > 0 ? 1 : -1)));
      // Handle mouse click event
      this._slidesContainer.querySelectorAll(":scope > .diapo-container > .diapo")
        .forEach((el, i) => el.addEventListener("click", () => this._handleClick(i)));
    }
    // Resize slides on window resize
    window.addEventListener("resize", () => this._rescale());

    // Navigate to the first slide
    this.navigate(window.location.hash ? parseInt(window.location.hash.slice(1)) : 0);
    // Set the default mode
    this.toggleMode(this._mode);
  }

  /**
   * Add DOM elements required for runtime and select key elements.
   * @param {HTMLElement?} element Slideshow main container element
   * @private
   */
  _prepare(element) {
    /** Slideshow main container element */
    this._container = element || document.querySelector(".diaporama");
    /** Slides container */
    this._slidesContainer = this._container.querySelector(":scope > .diapos");
    // Enhance slides DOM
    this._slidesContainer.querySelectorAll(":scope > .diapo").forEach((s) => {
      const sc = document.createElement("div");
      sc.classList.add("diapo-container");
      const notes = s.querySelector(":scope > .notes") || { outerHTML: "" };
      if (notes?.outerHTML) {
        s.removeChild(notes);
        notes.classList.replace("notes", "diapo-notes");
      }
      s.innerHTML = `<div class="diapo-content">${s.innerHTML}</div>${notes.outerHTML}`;
      sc.appendChild(this._slidesContainer.replaceChild(sc, s));
    });
    /** Slides containers */
    this._slides = this._slidesContainer.querySelectorAll(":scope > .diapo-container");
    // Add presentation mode elements
    let notes = document.createElement("div");
    notes.classList.add("notes");
    notes.innerHTML = '<div class="notes-header"><div class="index"></div><div class="timer"></div></div>'
      + '<div class="notes-current"></div><div class="notes-next"></div>';
    this._container.appendChild(notes);
    /** Slide index container element */
    this._indexContainer = this._container.querySelector(":scope > .notes .index");
    /** Timer element */
    this._timerContainer = this._container.querySelector(":scope > .notes .timer");
    /** Slide notes container elements in presentation mode */
    this._notesContainers = {
      /** Notes for the current slide */
      current: this._container.querySelector(":scope > .notes .notes-current"),
      /** Notes for the next slide */
      next: this._container.querySelector(":scope > .notes .notes-next")
    }
  }

  /**
   * Navigate to the given slide (make this slide the current one).
   * @param {number | "prev" | "next" | "first" | "last"} index Target slide index
   */
  navigate(index) {
    index = {
      "prev": this._current - 1, "next": this._current + 1,
      "first": 0, "last": this._slides.length - 1
    }[index] ?? index;
    if (!Number.isInteger(index) || index < 0 || index >= this._slides.length) {
      return;
    }
    // Navigate to the target slide
    this._raise("navigationStart", { index, element: this._slides[index] });
    this._slides[this._current].classList.remove("diapo-current");
    this._slides[index].classList.add("diapo-current");
    this._current = index;
    window.location.hash = `#${index}`;
    // Start the timer on the first navigation
    if (!this._startTime && index > 0) {
      this._startTime = new Date();
      this._updateTimer();
    }
    // Update index and speaker notes
    this._indexContainer.innerHTML = `${index + 1} <small>/ ${this._slides.length}</small>`;
    this._notesContainers.current.innerHTML = this._slides[index]
      .querySelector(".diapo-notes")?.innerHTML ?? "";
    this._notesContainers.next.innerHTML = index + 1 < this._slides.length ? this._slides[index + 1]
      .querySelector(".diapo-notes")?.innerHTML ?? "" : "";
    // Update cloned view
    if (this._clone && !this._clone.closed) {
      this._clone.window.$diapo.navigate(index);
    }
    // Rescale slides
    this._rescale();
    this._raise("navigationEnd", { index, element: this._slides[index] });
  }

  /**
   * Set the scale of each slide to fit its container.
   * @private
   */
  _rescale() {
    for (const slide of this._slides) {
      const slideContent = slide.querySelector(".diapo");
      const scale = Math.min(slide.clientWidth / slideContent.clientWidth,
        slide.clientHeight / slideContent.clientHeight);
      slideContent.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  }

  /**
   * Set the display mode to the given one if it's not already the current
   * otherwise switch to the default mode (show).
   * @param {"overview" | "presenter" | "show"} mode Target display mode
   */
  toggleMode(mode) {
    mode = mode === this._mode ? "show" : mode;
    this._container.classList.remove(`diaporama-${this._mode}`);
    this._container.classList.add(`diaporama-${mode}`);
    this._mode = mode;
    this._updateTimer();
    this._rescale();
    this._raise("modeToggle", { mode });
  }

  /**
   * Toggle the black screen.
   */
  toggleBlackScreen() {
    if (this._clone && !this._clone.closed) this._clone.window.$diapo.toggleBlackScreen();
    else if (this._mode === "show") this._container.classList.toggle("diaporama-black");
  }

  /**
   * Update the slideshow timer displayed value.
   * @param {boolean?} reset Reset the timer.
   */
  _updateTimer(reset) {
    if (!this._startTime) {
      this._timerContainer.innerHTML = "00:00:00";
      return;
    }
    if (this._mode !== "presenter") {
      return; // Timer is not visible on the screen: no update needed
    }
    if (reset) {
      this._startTime = new Date();
    }
    const totalMs = new Date() - this._startTime;
    const totalSec = Math.round(totalMs / 1000);
    const seconds = String(totalSec % 60).padStart(2, "0");
    const minutes = String(Math.floor(totalSec / 60) % 60).padStart(2, "0");
    const hours = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    this._timerContainer.innerHTML = `${hours}:${minutes}:${seconds}`;
    setTimeout(() => this._updateTimer(), (totalSec + 1) * 1000 - totalMs);
  }

  /**
   * Open the detached view.
   */
  openClone() {
    if (!this._clone || this._clone.closed) {
      const search = new URLSearchParams(location.search);
      search.set("clone", "1");
      const url = location.origin + location.pathname + "?" + search.toString() + location.hash;
      this._clone = window.open(url, "_blank", "menubar=no");
      this._raise("cloneOpen", { window: this._clone });
    } else {
      this._clone.focus();
    }
  }

  /**
   * Handle keydown events: navigate between slides
   * and toggle the display mode.
   * @param {KeyboardEvent} e Keydown event
   * @private
   */
  _handleKeyDown(e) {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    if (["ArrowRight", "ArrowDown", "PageDown", "Space"].includes(e.code)) {
      this.navigate("next");        // Navigate to the next slide
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.code)) {
      this.navigate("prev");        // Navigate to the previous slide
    } else if (e.code === "Home") {
      this.navigate("first");       // Navigate to the first slide
    } else if (e.code === "End") {
      this.navigate("last");        // Navigate to the last slide
    } else if (e.code === "KeyO") {
      this.toggleMode("overview");  // Toggle the overview mode
    } else if (e.code === "KeyP") {
      this.toggleMode("presenter"); // Toggle the presentation mode
    } else if (e.code === "Escape" || e.code === "Enter") {
      this.toggleMode("show");      // Toggle the default show mode
    } else if (e.code === "KeyB") {
      this.toggleBlackScreen();     // Toggle the black screen
    } else if (e.code === "KeyC" && this._mode === "presenter") {
      this.openClone();             // Open the clone view
    } else if (e.code === "KeyT") {
      this._updateTimer(true);      // Reset the timer
    }
  }

  /**
   * Handle mouse click event on slides: in overview and presenter modes,
   * navigate to the slide and, in overview mode, return to the default mode.
   * @param {number} i Slide index
   * @private
   */
  _handleClick(i) {
    if (this._mode === "overview" || this._mode === "presenter") {
      this.navigate(i);
      if (this._mode === "overview") {
        this.toggleMode("show");
      }
    }
  }

  /*
   * Events
   */

  /**
   * Subscribe to an event.
   * @param {"navigationStart" | "navigationEnd" | "modeToggle" | "cloneOpen"} name Event name
   * @param {function(Object):void} callback Function to call when the event is raised
   * @return {Diapo} this
   */
  on(name, callback) {
    if (!this._listeners[name] || this._listeners[name].length === 0) {
      this._listeners[name] = [];
    }
    this._listeners[name].push(callback);
    return this;
  }

  /**
   * Raise an event: call all listeners.
   * @param {"navigationStart" | "navigationEnd" | "modeToggle" | "cloneOpen"} name Event name
   * @param args Event arguments
   * @private
   */
  _raise(name, args) {
    if (this._listeners[name] && Array.isArray(this._listeners[name])) {
      for (const callback of this._listeners[name]) {
        callback(args);
      }
    }
  }
}
