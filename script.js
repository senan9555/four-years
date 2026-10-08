document.addEventListener("DOMContentLoaded", () => {
  const scenes = document.querySelectorAll(".scene");
  const progressBar = document.getElementById("progressBar");
  const chapterCounter = document.getElementById("chapterCounter");
  const music = document.getElementById("music");

  let musicStarted = false;
  let musicFadeStarted = false;
  let scrollHintHidden = false;


  /* =====================================================
     MUSIC
     Starts on the first REAL swipe / wheel movement
     ===================================================== */

  function startMusic() {
    if (!music || musicStarted || musicFadeStarted) return;

    musicStarted = true;

    music.volume = 0;

    const playPromise = music.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          fadeVolume(0, 0.55, 1800);
        })
        .catch(() => {
          musicStarted = false;
        });
    }
  }


  function fadeVolume(from, to, duration) {
    if (!music) return;

    const start = performance.now();

    function animate(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);

      music.volume =
        from + (to - from) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }


  function fadeOutMusic() {
    if (!music || musicFadeStarted) return;

    musicFadeStarted = true;

    const startVolume = music.volume;
    const duration = 4000;
    const start = performance.now();

    function animate(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);

      music.volume =
        startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        music.pause();
        music.currentTime = 0;
      }
    }

    requestAnimationFrame(animate);
  }


  /* =====================================================
     REAL USER SCROLL
     ===================================================== */

  let touchStartY = null;

  document.addEventListener(
    "touchstart",
    (event) => {
      if (!event.touches.length) return;

      touchStartY = event.touches[0].clientY;
    },
    {
      passive: true
    }
  );


  document.addEventListener(
    "touchmove",
    (event) => {
      if (!event.touches.length) return;

      const currentY = event.touches[0].clientY;

      if (touchStartY === null) {
        touchStartY = currentY;
        return;
      }

      const movement =
        Math.abs(currentY - touchStartY);

      /*
        Ignore tiny finger movements.
        Start music only when an actual swipe begins.
      */

      if (movement > 8) {
        startMusic();
        hideScrollHint();
      }
    },
    {
      passive: true
    }
  );


  document.addEventListener(
    "touchend",
    () => {
      touchStartY = null;
    },
    {
      passive: true
    }
  );


  /* Desktop / mouse wheel */

  document.addEventListener(
    "wheel",
    () => {
      startMusic();
      hideScrollHint();
    },
    {
      passive: true
    }
  );


  /* =====================================================
     SCROLL HINT
     ===================================================== */

  function hideScrollHint() {
    if (scrollHintHidden) return;

    if (window.scrollY > 15) {
      scrollHintHidden = true;

      document.body.classList.add(
        "has-started-scrolling"
      );
    }
  }


  /* =====================================================
     PROGRESS BAR
     ===================================================== */

  function updateProgress() {
    const scrollTop =
      window.scrollY || window.pageYOffset;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (documentHeight <= 0) {
      progressBar.style.width = "0%";
      return;
    }

    const progress =
      (scrollTop / documentHeight) * 100;

    progressBar.style.width =
      `${Math.min(progress, 100)}%`;
  }


  /* =====================================================
     CHAPTER COUNTER
     ===================================================== */

  function updateChapter(index) {
    if (!chapterCounter) return;

    const number =
      String(index + 1).padStart(2, "0");

    const total =
      String(scenes.length).padStart(2, "0");

    chapterCounter.textContent =
      `${number} / ${total}`;
  }


  /* =====================================================
     CURRENT SCENE
     ===================================================== */

  function updateCurrentScene() {
    if (!scenes.length) return;

    const viewportCenter =
      window.innerHeight / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    scenes.forEach((scene, index) => {
      const rect =
        scene.getBoundingClientRect();

      const sceneCenter =
        rect.top + rect.height / 2;

      const distance =
        Math.abs(
          sceneCenter - viewportCenter
        );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    updateChapter(closestIndex);

    if (
      closestIndex === scenes.length - 1 &&
      !musicFadeStarted
    ) {
      fadeOutMusic();
    }
  }


  /* =====================================================
     SCENE REVEAL
     ===================================================== */

  const observer =
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");
        });
      },
      {
        threshold: 0.35
      }
    );


  scenes.forEach((scene) => {
    observer.observe(scene);
  });


  /* =====================================================
     NORMAL SCROLL
     ===================================================== */

  window.addEventListener(
    "scroll",
    () => {
      hideScrollHint();
      updateProgress();
      updateCurrentScene();
    },
    {
      passive: true
    }
  );


  /* =====================================================
     INITIAL STATE
     ===================================================== */

  if (scenes.length > 0) {
    scenes[0].classList.add("visible");
    updateChapter(0);
  }

  updateProgress();
});
