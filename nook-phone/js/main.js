(() => {
  /**
   * Replace <img> with fetched <svg> so theme CSS can target internal ids.
   * Same-origin http(s) required (not file://).
   */
  async function inlineAppIcons() {
    const containers = document.querySelectorAll(".appContainer");
    for (const container of containers) {
      const img = container.querySelector("img");
      if (!img) continue;
      const srcAttr = img.getAttribute("src");
      if (!srcAttr) continue;
      const filename = srcAttr.split("/").pop().split("?")[0];
      const url = new URL(srcAttr, document.baseURI).href;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load ${srcAttr}: ${res.status}`);
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const root = doc.documentElement;
      const err = doc.querySelector("parsererror");
      if (err || !root || root.nodeName.toLowerCase() !== "svg") {
        throw new Error(`Invalid SVG: ${filename}`);
      }
      container.replaceChild(document.importNode(root, true), img);
    }
  }

  function setupClock() {
    const timeEl = document.getElementById("time");
    function formatTime() {
      return new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    function tick() {
      if (timeEl) timeEl.textContent = formatTime();
    }
    tick();
    setInterval(tick, 1000);
  }

  function setupAppHover() {
    const titleEl = document.getElementById("screen-title");
    const appEls = document.querySelectorAll(".appContainer");

    function setActive(title) {
      appEls.forEach((el) => {
        const label = el.getAttribute("data-app-label") ?? "";
        el.dataset.active = label === title ? "true" : "false";
      });
    }

    appEls.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const label = el.getAttribute("data-app-label") ?? "";
        if (titleEl) titleEl.textContent = label;
        setActive(label);
      });
    });
  }

  async function init() {
    await inlineAppIcons();
    setupClock();
    setupAppHover();
  }

  void init().catch((e) => {
    console.error(e);
  });
})();
