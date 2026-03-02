var anzhiyu = {
  // 音乐节目切换背景
  changeMusicBg: function (isChangeBg = true) {
    if (window.location.pathname !== "/music/") {
      return;
    }

    // 检查是否已存在 an_music_bg，避免重复创建
    let anMusicBg = document.getElementById("an_music_bg");
    if (!anMusicBg) {
      anMusicBg = document.createElement("div");
      anMusicBg.id = "an_music_bg";
      document.body.appendChild(anMusicBg);
    }

    const updateBackground = () => {
      const musicCover = document.querySelector("#anMusic-page .aplayer-pic");
      if (musicCover) {
        anMusicBg.style.backgroundImage = musicCover.style.backgroundImage;
      }
    };

    if (isChangeBg) {
      updateBackground();
    } else {
      const timer = setInterval(() => {
        if (document.querySelector("#anMusic-page .aplayer-pic")) {
          clearInterval(timer);
          updateBackground();
          anzhiyu.addEventListenerChangeMusicBg();

          const navMusic = document.querySelector("#nav-music meting-js");
          if (navMusic?.aplayer && !navMusic.aplayer.audio.paused) {
            anzhiyu.musicToggle();
          }
        }
      }, 100);
    }
  },

  addEventListenerChangeMusicBg: function () {
    const anMusicPage = document.getElementById("anMusic-page");
    if (!anMusicPage) return;

    const metingJs = anMusicPage.querySelector("meting-js");
    metingJs?.aplayer?.on("loadeddata", () => {
      anzhiyu.changeMusicBg();
      console.info("player loadeddata");
    });

    const aplayerIconMenu = anMusicPage.querySelector(".aplayer-info .aplayer-time .aplayer-icon-menu");
    aplayerIconMenu?.addEventListener("click", () => {
      const menuMask = document.getElementById("menu-mask");
      if (menuMask) {
        menuMask.style.display = "block";
        menuMask.style.animation = "0.5s ease 0s 1 normal none running to_show";
      }
    });

    const menuMask = document.getElementById("menu-mask");
    menuMask?.addEventListener("click", () => {
      if (window.location.pathname !== "/music/") return;
      const aplayerList = anMusicPage.querySelector(".aplayer-list");
      aplayerList?.classList.remove("aplayer-list-hide");
    });
  },
};

// DOM 加载完成后再调用
window.addEventListener("DOMContentLoaded", () => {
  anzhiyu.changeMusicBg(false);
});
