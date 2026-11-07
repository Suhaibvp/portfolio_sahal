(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const splitText = (el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = ch === " " ? "char char-space" : "char";
      span.textContent = ch === " " ? "" : ch;
      el.appendChild(span);
    }
  };

  document.querySelectorAll("[data-split]").forEach(splitText);

  const contact = document.getElementById("contact");
  const openContact = document.getElementById("dm-open");
  openContact.addEventListener("click", () => contact.showModal());

  if (reduce) {
    document.documentElement.classList.add("reduce");
    document.documentElement.classList.remove("is-booting");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 0.85,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    syncTouch: true,
  });

  let onLenisScroll = () => ScrollTrigger.update();
  lenis.on("scroll", (instance) => onLenisScroll(instance));
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const hint = document.getElementById("scroll-hint");

  const prepType = (el) => {
    const full = el.textContent.trim();
    el.dataset.full = full;
    el.textContent = "";
    el.classList.add("type-line");
    const node = document.createTextNode("");
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.hidden = true;
    el.append(node, caret);
  };

  const typewrite = (tl, el, pace = 0.04, min = 0.32) => {
    if (!el.dataset.full) prepType(el);
    const full = el.dataset.full || "";
    const node = el.firstChild;
    const caret = el.querySelector(".caret");
    const state = { i: 0 };
    tl.call(() => {
      caret.hidden = false;
    });
    tl.to(state, {
      i: full.length,
      duration: Math.max(min, full.length * pace),
      ease: "none",
      onUpdate: () => {
        node.nodeValue = full.slice(0, Math.round(state.i));
      },
    });
    tl.call(() => {
      node.nodeValue = full;
      caret.hidden = true;
    });
  };

  const beat = (tl, gap = 0.2) => {
    tl.to({}, { duration: gap });
  };

  const whenReady = async () => {
    const portrait = document.querySelector(".person-img");
    if (portrait && !portrait.complete) {
      await new Promise((resolve) => {
        portrait.addEventListener("load", resolve, { once: true });
        portrait.addEventListener("error", resolve, { once: true });
      });
    }
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  };

  const playLoops = () => {
    document.querySelectorAll(".card-media").forEach((media) => {
      const frames = media.querySelectorAll(".swap");
      if (frames.length < 2) return;
      const [a, b] = frames;
      gsap.set(a, { autoAlpha: 1, scale: 1 });
      gsap.set(b, { autoAlpha: 0, scale: 1.08 });
      gsap.to(a, {
        scale: 1.08,
        duration: 7.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(b, {
        scale: 1.08,
        duration: 7.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.fromTo(
        b,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 1.05,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 2.15,
        }
      );
    });

    const lines = gsap.utils.toArray(".talk-line");
    gsap.set(lines, { autoAlpha: 0, y: 12 });
    const talk = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    lines.forEach((line) => {
      talk.to(line, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" });
      talk.to({}, { duration: 0.35 });
    });
    talk.to(
      lines,
      { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" },
      "+=0.35"
    );

    const flash = ".doc-flash";
    const quote = ".doc-quote";
    const person = ".doc-person";
    const doc = gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
    doc.fromTo(
      flash,
      { autoAlpha: 0, scaleX: 0.55 },
      { autoAlpha: 1, scaleX: 1, duration: 0.5, ease: "power3.out" }
    );
    doc.to(flash, { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, "+=0.55");
    doc.fromTo(
      quote,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.48, ease: "power3.out" }
    );
    doc.to(quote, { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in" }, "+=1.1");
    doc.fromTo(
      person,
      { autoAlpha: 0, scale: 0.94 },
      { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" }
    );
    doc.to(person, { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, "+=1.3");
  };

  const build = () => {
    document.querySelectorAll("[data-type]").forEach(prepType);

    let intro;
    let introDone = false;
    const finishIntro = () => {
      if (introDone) return;
      introDone = true;
      if (intro && intro.progress() < 1) intro.progress(1).pause();
      hint.style.opacity = "1";
    };

    intro = gsap.timeline({
      defaults: { ease: "power4.out" },
      onComplete: finishIntro,
    });

    intro.from(
      ".hero-word .char",
      { y: 54, autoAlpha: 0, stagger: 0.035, duration: 0.85 },
      0.12
    );
    intro.from(
      ".person-slot-hero .person-img",
      { y: 170, autoAlpha: 0, duration: 1.25, ease: "power3.out" },
      0.18
    );
    intro.add(() => {}, 1.15);
    typewrite(intro, document.querySelector(".hi"), 0.07);
    beat(intro, 0.16);
    intro.from(".name .char", {
      y: 64,
      autoAlpha: 0,
      stagger: 0.055,
      duration: 0.62,
      ease: "power4.out",
    });
    beat(intro, 0.12);
    typewrite(intro, document.querySelector(".role"), 0.055);
    beat(intro, 0.22);
    gsap.utils.toArray(".service-line").forEach((line) => {
      typewrite(intro, line, 0.046);
      beat(intro, 0.18);
    });

    gsap.set(".card", { yPercent: 118, autoAlpha: 0 });
    gsap.set(
      [".scene-experience", ".scene-skills", ".scene-achieve", ".scene-thanks"],
      { autoAlpha: 0, y: 36 }
    );
    gsap.set(
      ".panel-title .char, .job-when, .skill-label, .chip, .ach-num, .thanks-word .char, .dm",
      { autoAlpha: 0 }
    );
    gsap.set(".person-slot-thanks .person-img", { autoAlpha: 0, y: 120 });
    gsap.set(".job-when, .skill-label, .chip, .ach-num, .dm", { y: 16 });
    gsap.set(".panel-title .char, .thanks-word .char", { y: 34 });
    gsap.set(".job li, .background p, .ach", { height: 0, overflow: "hidden" });

    let story;
    let cueSequences = () => {};
    let scrollVelocity = 0;

    story = gsap.timeline({
      defaults: { ease: "none" },
      onUpdate: () => {
        if (story) cueSequences(story.time());
      },
      scrollTrigger: {
        trigger: ".story",
        start: "top top",
        end: "bottom bottom",
        pin: ".stage",
        scrub: 0.4,
        anticipatePin: 1,
        onUpdate: (self) => {
          scrollVelocity = self.getVelocity();
          if (!introDone && self.scroll() > 24) finishIntro();
          hint.classList.toggle("is-hidden", self.progress > 0.02);
        },
      },
    });

    story.to(".scene-hero", { y: -40, autoAlpha: 0, duration: 0.7 }, 0.25);
    story.to(
      ".card",
      { yPercent: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7 },
      0.4
    );
    story.to(".scene-work", { autoAlpha: 0, y: -28, duration: 0.55 }, 1.35);
    story.to(".scene-experience", { autoAlpha: 1, y: 0, duration: 0.5 }, 1.2);
    story.to(".scene-experience", { autoAlpha: 0, y: -28, duration: 0.5 }, 2.05);
    story.to(".scene-skills", { autoAlpha: 1, y: 0, duration: 0.5 }, 1.95);
    story.to(".scene-skills", { autoAlpha: 0, y: -28, duration: 0.5 }, 2.75);
    story.to(".scene-achieve", { autoAlpha: 1, y: 0, duration: 0.5 }, 2.65);
    story.to(".scene-achieve", { autoAlpha: 0, y: -28, duration: 0.5 }, 3.45);
    story.to(".scene-thanks", { autoAlpha: 1, y: 0, duration: 0.5 }, 3.35);
    story.to({}, { duration: 0.3 });

    const sequences = [];
    const addSequence = (at, leave, buildTl) => {
      const tl = gsap.timeline({ paused: true });
      buildTl(tl);
      sequences.push({ at, leave, tl, started: false });
    };

    addSequence(0.55, 1.45, (tl) => {
      typewrite(tl, document.querySelector(".work-kicker"), 0.05);
      beat(tl, 0.16);
      gsap.utils.toArray(".card h2").forEach((heading) => {
        typewrite(tl, heading, 0.042);
        beat(tl, 0.16);
      });
    });

    addSequence(1.25, 2.15, (tl) => {
      tl.to(".scene-experience .panel-title .char", {
        y: 0,
        autoAlpha: 1,
        stagger: 0.012,
        duration: 0.18,
        ease: "power4.out",
      });
      beat(tl, 0.03);
      const heads = gsap.utils.toArray(".job-head");
      const lists = gsap.utils.toArray(".job ul");
      heads.forEach((head, index) => {
        tl.to(head.querySelector(".job-when"), {
          y: 0,
          autoAlpha: 1,
          duration: 0.1,
          ease: "power3.out",
        });
        typewrite(tl, head.querySelector(".job-co"), 0.006, 0.08);
        typewrite(tl, head.querySelector(".job-role"), 0.005, 0.08);
        lists[index].querySelectorAll("li").forEach((line) => {
          tl.to(line, { height: "auto", duration: 0.08, ease: "power2.out" });
          typewrite(tl, line, 0.004, 0.1);
          beat(tl, 0.03);
        });
        beat(tl, 0.04);
      });
    });

    addSequence(2.0, 2.85, (tl) => {
      tl.to(".scene-skills .panel-title .char", {
        y: 0,
        autoAlpha: 1,
        stagger: 0.012,
        duration: 0.16,
        ease: "power4.out",
      });
      const labels = gsap.utils.toArray(".skill-label");
      const groups = gsap.utils.toArray(".chips");
      labels.forEach((label, index) => {
        tl.to(label, { y: 0, autoAlpha: 1, duration: 0.1, ease: "power3.out" });
        groups[index].querySelectorAll(".chip").forEach((chip) => {
          tl.to(chip, { y: 0, autoAlpha: 1, duration: 0.08, ease: "power3.out" });
          beat(tl, 0.015);
        });
      });
      document.querySelectorAll(".background p").forEach((line) => {
        tl.to(line, { height: "auto", duration: 0.08, ease: "power2.out" });
        typewrite(tl, line, 0.004, 0.08);
        beat(tl, 0.03);
      });
    });

    addSequence(2.7, 3.55, (tl) => {
      tl.to(".scene-achieve .panel-title .char", {
        y: 0,
        autoAlpha: 1,
        stagger: 0.01,
        duration: 0.16,
        ease: "power4.out",
      });
      beat(tl, 0.03);
      gsap.utils.toArray(".ach").forEach((row) => {
        tl.to(row, { height: "auto", duration: 0.1, ease: "power3.out" });
        tl.to(
          row.querySelector(".ach-num"),
          { y: 0, autoAlpha: 1, duration: 0.14, ease: "back.out(1.5)" },
          "<"
        );
        typewrite(tl, row.querySelector(".ach-copy"), 0.004, 0.08);
        beat(tl, 0.04);
      });
    });

    addSequence(3.4, 99, (tl) => {
      tl.to(".thanks-word .char", {
        y: 0,
        autoAlpha: 1,
        stagger: 0.045,
        duration: 0.45,
        ease: "power4.out",
      });
      tl.to(
        ".person-slot-thanks .person-img",
        { y: 0, autoAlpha: 1, duration: 0.75, ease: "power3.out" },
        "<0.08"
      );
      typewrite(tl, document.querySelector(".level"), 0.08);
      beat(tl, 0.14);
      tl.to(".dm", { y: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(1.7)" });
    });

    const finishSequence = (seq) => {
      seq.started = true;
      if (seq.tl.progress() < 1) seq.tl.progress(1);
      seq.tl.pause();
    };

    cueSequences = (time) => {
      const skipping = Math.abs(scrollVelocity) > 3200;
      sequences.forEach((seq) => {
        const passed = time >= seq.leave || (skipping && time >= seq.at);
        if (passed) {
          finishSequence(seq);
          return;
        }
        if (time < seq.at || seq.started) return;
        seq.started = true;
        seq.tl.play();
      });
    };
    cueSequences(story.time());

    onLenisScroll = (instance) => {
      ScrollTrigger.update();
      if (!introDone && instance.scroll > 24) finishIntro();
    };

    const scrollBy = (delta) => {
      if (delta > 8) finishIntro();
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const current = typeof lenis.scroll === "number" ? lenis.scroll : window.scrollY;
      lenis.scrollTo(Math.max(0, Math.min(max, current + delta)), { duration: 0.65 });
    };

    hint.addEventListener("click", () => {
      finishIntro();
      scrollBy(window.innerHeight * 0.85);
    });

    window.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector("dialog[open]")) return;
      const tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return;
      const step = Math.max(window.innerHeight * 0.72, 480);
      if (event.key === "ArrowDown") scrollBy(step * 0.5);
      else if (event.key === "ArrowUp") scrollBy(-step * 0.5);
      else if (event.key === "PageDown" || event.key === " ") scrollBy(step);
      else if (event.key === "PageUp") scrollBy(-step);
      else if (event.key === "Home") scrollBy(-1e6);
      else if (event.key === "End") scrollBy(1e6);
      else return;
      event.preventDefault();
    });

    document.documentElement.classList.remove("is-booting");
    playLoops();
    ScrollTrigger.refresh();
  };

  whenReady().then(build);
})();
