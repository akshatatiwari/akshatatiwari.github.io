(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Scroll-spy nav + reading-progress line, both driven by one scroll handler.
  const links = [...document.querySelectorAll(".toc a")];
  const linkFor = new Map(links.map((a) => [a.hash.slice(1), a]));
  const sections = [...document.querySelectorAll("main section[id]")];
  const setActive = (id) => {
    links.forEach((a) => a.removeAttribute("aria-current"));
    linkFor.get(id)?.setAttribute("aria-current", "true");
  };
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty("--progress", max > 0 ? Math.min(scrollY / max, 1) : 0);

    // The last section is short, so it may never reach the trigger line.
    if (scrollY >= max - 4) {
      setActive(sections[sections.length - 1]?.id);
      return;
    }
    const triggerLine = innerHeight * 0.4;
    let current = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= triggerLine) current = s;
    }
    setActive(current?.id);
  };
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // Count a stat up from zero the first time it is shown.
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Fade blocks in as they enter the viewport.
  const reveals = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll("[data-count]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
    counters.forEach((el) => { el.textContent = `0${el.dataset.suffix || ""}`; });
  }

  // Cursor-following glow inside cards, boxes and entries.
  if (finePointer && !reduceMotion) {
    addEventListener("pointermove", (e) => {
      const el = e.target.closest?.(".glow");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  // Hovering an outcome box lights up its part of the diagram, and vice versa.
  const parts = document.querySelectorAll("[data-part]");
  const light = (key, on) => {
    document.querySelectorAll(`[data-part="${key}"]`).forEach((el) => el.classList.toggle("is-lit", on));
  };
  parts.forEach((el) => {
    el.addEventListener("pointerenter", () => light(el.dataset.part, true));
    el.addEventListener("pointerleave", () => light(el.dataset.part, false));
  });

  // Light/dark switch. A click is remembered; until then the system setting applies.
  const toggle = document.querySelector(".theme-toggle");
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");
  const syncTheme = () => {
    toggle?.setAttribute("aria-checked", String(currentTheme() === "dark"));
    if (root.dataset.theme) {
      const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { m.content = bg; });
    }
  };
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch (e) { /* Storage blocked: the choice lasts this visit. */ }
    syncTheme();
  };
  toggle?.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => setTheme(next));
    else setTheme(next);
  });
  systemDark.addEventListener("change", syncTheme);
  syncTheme();

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
