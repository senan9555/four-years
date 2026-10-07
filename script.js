document.addEventListener("DOMContentLoaded", () => {

  const scenes = document.querySelectorAll(".scene");
  const progressBar = document.getElementById("progressBar");
  const chapterCounter = document.getElementById("chapterCounter");
  const music = document.getElementById("music");

  let musicStarted = false;
  let musicFadeStarted = false;
  let scrollHintHidden = false;
  let currentScene = 0;


  /* =========================
     MUSIC
  ========================= */

  function startMusic() {

    if (!music || musicStarted) return;

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


  function userStartedInteraction() {

    if (!musicStarted) {
      startMusic();
    }

    hideScrollHint();
  }


  document.addEventListener(
    "touchstart",
    userStartedInteraction,
    { passive: true }
  );

  document.addEventListener(
    "pointerdown",
    userStartedInteraction,
    { passive: true }
  );


  /* =========================
     SCROLL HINT
  ========================= */

  function hideScrollHint() {

    if (scrollHintHidden) return;

    if (window.scrollY > 15) {

      scrollHintHidden = true;

      document.body.classList.add(
        "has-started-scrolling"
      );
    }
  }


  /* =========================
     PROGRESS
  ========================= */

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


  /* =========================
     CHAPTER COUNTER
  ========================= */

  function updateChapter(index) {

    if (!chapterCounter) return;

    const number =
      String(index + 1).padStart(2, "0");

    chapterCounter.textContent =
      `${number} / ${String(scenes.length).padStart(2, "0")}`;
  }


  /* =========================
     SCENE OBSERVER
  ========================= */

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("visible");

          const index =
            Array.from(scenes).indexOf(entry.target);

          if (index !== -1) {

            currentScene = index;

            updateChapter(index);
          }

          /*
             Fade music on final scene
          */

          if (
            index === scenes.length - 1 &&
            !musicFadeStarted
          ) {

            fadeOutMusic();
          }

        });

      },
      {
        threshold: 0.45
      }
    );


  scenes.forEach((scene) => {
    observer.observe(scene);
  });


  /* =========================
     SCROLL
  ========================= */

  window.addEventListener(
    "scroll",
    () => {

      hideScrollHint();
      updateProgress();

    },
    { passive: true }
  );


  /* =========================
     INITIAL STATE
  ========================= */

  if (scenes.length > 0) {

    scenes[0].classList.add("visible");

    updateChapter(0);
  }

  updateProgress();

});
