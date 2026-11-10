(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const deck = document.getElementById("deck");
  const track = document.getElementById("track");
  const slides = [...track.children];
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const pager = document.getElementById("pager");
  const wipe = document.getElementById("wipe");
  let index = 0;
  let wheelAt = 0;
  let token = 0;

  const width = () => deck.clientWidth;

  const splitHeading = (el) => {
    const lines = [...el.children].filter(
      (node) => node.tagName === "SPAN" && !node.classList.contains("char")
    );
    const blocks = lines.length ? lines : [el];
    blocks.forEach((block) => {
      if (block.querySelector(".char")) return;
      const text = block.textContent;
      block.textContent = "";
      for (const ch of text) {
        const span = document.createElement("span");
        span.className = ch === " " ? "char space" : "char";
        span.textContent = ch === " " ? "\u00a0" : ch;
        block.appendChild(span);
      }
    });
  };

  document.querySelectorAll(".mega, .hero-word").forEach(splitHeading);

  const parts = (slide) => ({
    chars: slide.querySelectorAll(".char"),
    people: slide.querySelectorAll(".figure img"),
    cards: slide.querySelectorAll(".tile, .posters figure, .window, .polaroids img"),
    bits: slide.querySelectorAll(
      "[data-in]:not(.mega):not(.hero-word):not(.tile):not(.window)"
    ),
    halo: slide.querySelector(".halo"),
  });

  const acctCards = [...document.querySelectorAll(".acct")];
  const acctName = document.getElementById("acctName");
  const acctPrev = document.getElementById("acctPrev");
  const acctNext = document.getElementById("acctNext");
  let acct = 0;

  const layoutAccounts = (animate) => {
    if (!acctCards.length) return;
    const gap = Math.min(250, Math.max(150, width() * 0.24));
    acctCards.forEach((card, i) => {
      const offset = i - acct;
      const distance = Math.abs(offset);
      gsap.to(card, {
        x: offset * gap,
        y: distance * 24,
        z: -distance * 180,
        rotateX: 26,
        rotateY: Math.max(-48, Math.min(48, offset * -28)),
        scale: Math.max(0.68, 1 - distance * 0.09),
        autoAlpha: distance > 3 ? 0 : 1,
        duration: animate && !reduce ? 0.7 : 0,
        ease: "power3.out",
        overwrite: true,
      });
      card.style.zIndex = String(40 - distance);
    });
    acctName.textContent = acctCards[acct].dataset.name || "";
    acctPrev.disabled = acct === 0;
    acctNext.disabled = acct === acctCards.length - 1;
  };

  const shiftAccount = (step) => {
    const next = Math.max(0, Math.min(acctCards.length - 1, acct + step));
    if (next === acct) return;
    acct = next;
    layoutAccounts(true);
  };

  const reveal = (i, dir = 1) => {
    const slide = slides[i];
    const { chars, people, cards, bits, halo } = parts(slide);
    const fromX = dir * 110;

    if (reduce) {
      gsap.set([chars, people, cards, bits, halo], { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      if (slide.classList.contains("slide-accounts")) layoutAccounts(false);
      return;
    }

    const letters = gsap.fromTo(
      chars,
      { x: fromX, autoAlpha: 0, skewX: dir * -16 },
      {
        x: 0,
        autoAlpha: 1,
        skewX: 0,
        duration: 0.52,
        stagger: 0.028,
        ease: "power4.out",
        overwrite: true,
      }
    );

    const copy = [...bits].filter(
      (el) => !el.closest(".posters, .polaroids, .windows, .figure")
    );
    const hero = i === 0;
    const afterWord = hero ? letters.duration() : 0.12;
    gsap.fromTo(
      copy,
      { x: fromX * 0.4, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.48,
        stagger: 0.055,
        delay: afterWord,
        ease: "power3.out",
        overwrite: true,
      }
    );

    if (people.length) {
      gsap.fromTo(
        people,
        hero
          ? { autoAlpha: 0, x: 0, y: 0, scale: 1 }
          : { autoAlpha: 0, x: fromX * 0.25, y: 80, scale: 1.06 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: hero ? 1.05 : 0.85,
          delay: hero ? letters.duration() : 0.06,
          ease: hero ? "power2.out" : "power3.out",
          overwrite: true,
        }
      );
    }

    if (halo) {
      gsap.fromTo(
        halo,
        { autoAlpha: 0, scale: 0.2, x: 0 },
        {
          autoAlpha: 1,
          scale: 1,
          x: 0,
          duration: 0.7,
          delay: hero ? letters.duration() : 0.06,
          ease: "back.out(1.6)",
          overwrite: true,
        }
      );
    }

    if (cards.length) {
      gsap.fromTo(
        cards,
        { autoAlpha: 0, x: fromX * 0.3, y: 36, scale: 0.82 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.08,
          ease: "back.out(1.5)",
          overwrite: true,
        }
      );
    }
    if (slide.classList.contains("slide-accounts")) layoutAccounts(true);
  };

  const streak = (dir) => {
    gsap.fromTo(
      wipe,
      { opacity: 0, x: dir * -220 },
      {
        opacity: 0.8,
        x: dir * 260,
        duration: 0.16,
        ease: "none",
        yoyo: true,
        repeat: 1,
        overwrite: true,
      }
    );
  };

  const paint = () => {
    const label = String(index + 1).padStart(2, "0");
    const total = String(slides.length).padStart(2, "0");
    pager.textContent = `${label}  /  ${total}  ${slides[index].dataset.title || ""}`;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  };

  const go = (nextIndex) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, nextIndex));
    if (clamped === index) return;
    const dir = clamped > index ? 1 : -1;
    const leaving = slides[index];
    index = clamped;
    const mine = ++token;

    if (!reduce) {
      streak(dir);
      gsap.to(deck, {
        filter: "blur(5px)",
        duration: 0.1,
        ease: "none",
        overwrite: true,
        onComplete: () => {
          gsap.to(deck, { filter: "blur(0px)", duration: 0.28, ease: "power2.out", overwrite: true });
        },
      });
      gsap.to(leaving.querySelectorAll(".char"), {
        x: dir * -220,
        autoAlpha: 0,
        skewX: dir * 24,
        duration: 0.28,
        ease: "power2.in",
        overwrite: true,
      });
      gsap.to(leaving.querySelectorAll("[data-in]:not(.mega):not(.hero-word), .halo"), {
        x: dir * -180,
        autoAlpha: 0,
        duration: 0.28,
        ease: "power2.in",
        overwrite: true,
      });
    }

    gsap.to(track, {
      x: -index * width(),
      duration: reduce ? 0 : 0.42,
      ease: "power2.inOut",
      overwrite: true,
    });
    paint();
    gsap.delayedCall(reduce ? 0 : 0.08, () => {
      if (mine === token) reveal(index, dir);
    });
  };

  const fitHero = () => {
    const word = document.querySelector(".slide-hero .hero-word:not(.thanks)");
    if (!word) return;
    word.style.fontSize = "100px";
    const measured = word.getBoundingClientRect().width;
    if (!measured) return;
    word.style.fontSize = `${(100 * width() * 0.97) / measured}px`;
  };

  gsap.set(".mega, .hero-word", { autoAlpha: 1 });
  fitHero();
  layoutAccounts(false);
  reveal(0, 1);
  paint();
  document.documentElement.classList.remove("is-booting");

  acctPrev.addEventListener("click", () => shiftAccount(-1));
  acctNext.addEventListener("click", () => shiftAccount(1));

  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));

  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "ArrowRight" || event.key === "PageDown") go(index + 1);
    else if (event.key === "ArrowLeft" || event.key === "PageUp") go(index - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(slides.length - 1);
    else return;
    event.preventDefault();
  });

  window.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const now = performance.now();
      if (now - wheelAt < 460) return;
      const main = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(main) < 10) return;
      wheelAt = now;
      go(index + (main > 0 ? 1 : -1));
    },
    { passive: false }
  );

  let startX = 0;
  let startY = 0;
  let tracking = false;
  deck.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button")) return;
    tracking = event.target.closest(".acct-stage") ? "accounts" : "deck";
    startX = event.clientX;
    startY = event.clientY;
  });
  deck.addEventListener("pointerup", (event) => {
    if (!tracking) return;
    const mode = tracking;
    tracking = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    if (mode === "accounts") shiftAccount(dx < 0 ? 1 : -1);
    else go(index + (dx < 0 ? 1 : -1));
  });

  window.addEventListener("resize", () => {
    fitHero();
    layoutAccounts(false);
    gsap.set(track, { x: -index * width() });
  });
})();
