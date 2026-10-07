document.addEventListener("DOMContentLoaded", () => {

  const scenes = document.querySelectorAll(".scene");
  const progressBar = document.getElementById("progressBar");
  const music = document.getElementById("music");

  let musicStarted = false;
  let musicFadeStarted = false;

  /* --------------------------------
     SCENE REVEAL
  -------------------------------- */

  const observer = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          /*
            Start music only after the user
            has actually begun scrolling.
          */
          if (!musicStarted && entry.target !== scenes[0]) {
            startMusic();
          }

          /*
            Fade music near the final scene.
          */
          const index = Array.from(scenes).indexOf(entry.target);

          if (
            index === scenes.length - 1 &&
            !musicFadeStarted
          ) {
            fadeOutMusic();
          }
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


  /* --------------------------------
     MUSIC
  -------------------------------- */

  function startMusic() {

    if (!music || musicStarted) return;

    musicStarted = true;

    music.volume = 0;

    const playPromise = music.play();

    if (playPromise !== undefined) {

      playPromise
        .then(() => {

          fadeVolume(
            0,
            0.55,
            1800
          );

        })
        .catch(() => {
          /*
            Some browsers may block autoplay.
            Music will remain silent in that case.
          */
        });

    }
  }


  function fadeVolume(from, to, duration) {

    const start = performance.now();

    function animate(time) {

      const elapsed = time - start;
      const progress = Math.min(
        elapsed / duration,
        1
      );

      const value =
        from + (to - from) * progress;

      music.volume = value;

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
    const duration = 3500;
    const start = performance.now();

    function animate(time) {

      const elapsed = time - start;

      const progress = Math.min(
        elapsed / duration,
        1
      );

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


  /* --------------------------------
     PROGRESS BAR
  -------------------------------- */

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


  window.addEventListener(
    "scroll",
    updateProgress,
    { passive: true }
  );

  updateProgress();


  /* --------------------------------
     FIRST SCENE
  -------------------------------- */

  if (scenes.length > 0) {
    scenes[0].classList.add("visible");
  }

});
