"use strict";

/* ==================================================
    BLUEBLACK PREMIUM V7
    SCRIPT.JS
================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const CONFIG = window.SITE_CONFIG || {};

/* ===============================
   HELPERS
============================== */

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const pad = (n) => String(n).padStart(2, "0");

function formatTime(seconds = 0) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${pad(s)}`;
}

function truncate(text = "", max = 24) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function makeTrackCover(track, index) {
    const colors = track.colors || ["#0f172a", "#2563eb", "#22d3ee"];
    const title = truncate(track.title || "Track", 22);
    const artist = truncate(track.artist || "Trần Bá Hiếu", 18);
    const initials = (track.title || "T")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
        <defs>
            <linearGradient id="bg${index}" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${colors[0]}" />
                <stop offset="52%" stop-color="${colors[1]}" />
                <stop offset="100%" stop-color="${colors[2]}" />
            </linearGradient>
            <filter id="blur${index}">
                <feGaussianBlur stdDeviation="24" />
            </filter>
        </defs>
        <rect width="800" height="800" rx="120" fill="url(#bg${index})"/>
        <circle cx="180" cy="160" r="120" fill="rgba(255,255,255,0.16)" filter="url(#blur${index})"/>
        <circle cx="680" cy="180" r="150" fill="rgba(255,255,255,0.12)" filter="url(#blur${index})"/>
        <circle cx="620" cy="620" r="180" fill="rgba(255,255,255,0.08)" filter="url(#blur${index})"/>
        <text x="50%" y="46%" text-anchor="middle" font-family="Poppins,Arial,sans-serif"
              font-size="130" font-weight="800" fill="rgba(255,255,255,0.96)" letter-spacing="4">${initials}</text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Poppins,Arial,sans-serif"
              font-size="38" font-weight="600" fill="rgba(255,255,255,0.92)">${title}</text>
        <text x="50%" y="68%" text-anchor="middle" font-family="Poppins,Arial,sans-serif"
              font-size="28" font-weight="400" fill="rgba(255,255,255,0.82)">${artist}</text>
        <rect x="160" y="675" width="480" height="8" rx="4" fill="rgba(255,255,255,0.22)" />
        <rect x="160" y="675" width="250" height="8" rx="4" fill="rgba(255,255,255,0.72)" />
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

/* ===============================
   LOADER 1% -> 100%
============================== */

const loader = $("#loader");
const loaderPercent = $("#loaderPercent");
const loaderBar = $("#loaderBar");
const loaderParticles = $("#loaderParticles");

let pageLoaded = false;
let loaderProgress = 1;
let loaderRafId = null;
let loaderReadyFallback = null;

function buildLoaderParticles() {
    if (!loaderParticles) return;
    loaderParticles.innerHTML = "";
    const count = 24;
    for (let i = 0; i < count; i++) {
        const dot = document.createElement("span");
        const size = 4 + Math.random() * 7;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.left = `${10 + Math.random() * 80}%`;
        dot.style.top = `${10 + Math.random() * 75}%`;
        dot.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 18}px`);
        dot.style.setProperty("--dy", `${(Math.random() * 2 - 1) * 18}px`);
        dot.style.animationDelay = `${Math.random() * 2.2}s`;
        dot.style.animationDuration = `${2.8 + Math.random() * 2.8}s`;
        loaderParticles.appendChild(dot);
    }
}

function renderLoader(progress) {
    const value = clamp(Math.round(progress), 1, 100);
    if (loaderPercent) loaderPercent.textContent = `${value}%`;
    if (loaderBar) loaderBar.style.width = `${value}%`;
    if (loader) loader.style.setProperty("--loader-progress", `${value}%`);
}

function hideLoader() {
    if (!loader || loader.classList.contains("is-hidden")) return;
    loader.classList.add("is-hidden");
    window.setTimeout(() => {
        if (loader) loader.style.display = "none";
    }, 780);
}

function finishLoaderIfReady() {
    if (pageLoaded && loaderProgress >= 100) {
        setTimeout(hideLoader, 260);
    }
}

function animateLoader(now) {
    const duration = 2600; // smooth 1 -> 100
    const ratio = clamp((now - animateLoader.start) / duration, 0, 1);
    loaderProgress = 1 + (ratio * 99);
    renderLoader(loaderProgress);

    if (ratio < 1) {
        loaderRafId = requestAnimationFrame(animateLoader);
    } else {
        loaderProgress = 100;
        renderLoader(loaderProgress);
        finishLoaderIfReady();
    }
}
animateLoader.start = performance.now();

function startLoader() {
    buildLoaderParticles();
    renderLoader(loaderProgress);
    loaderRafId = requestAnimationFrame(animateLoader);

    // Fallback: never keep the loader stuck if the page-load event is delayed.
    loaderReadyFallback = window.setTimeout(() => {
        pageLoaded = true;
        finishLoaderIfReady();
    }, 6500);
}

window.addEventListener("load", () => {
    pageLoaded = true;
    finishLoaderIfReady();
});

startLoader();

/* ===============================
   TYPING EFFECT
============================== */


const typing = $(".typing");
const words = Array.isArray(CONFIG.heroWords) && CONFIG.heroWords.length
    ? CONFIG.heroWords
    : ["Frontend Developer", "UI Designer", "Creative Coder", "JavaScript Developer"];

if (typing) {
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const current = words[wordIndex];

        if (!deleting) {
            typing.textContent = current.slice(0, charIndex++);
            if (charIndex > current.length) {
                deleting = true;
                return setTimeout(tick, 1100);
            }
        } else {
            typing.textContent = current.slice(0, charIndex--);
            if (charIndex < 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                charIndex = 0;
            }
        }
        setTimeout(tick, deleting ? 45 : 92);
    };

    tick();
}

/* ===============================
   HEADER / MOBILE MENU
============================== */

const header = $("#header");
const menuBtn = $("#menuBtn");
const navMenu = $(".nav-menu");
const topBtn = $("#topBtn");
const navLinks = $$(".nav-menu a");
const sections = $$("section[id]");

window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("active", window.scrollY > 80);

    if (topBtn) topBtn.classList.toggle("show", window.scrollY > 600);

    let current = "";
    sections.forEach((sec) => {
        const top = sec.offsetTop - 180;
        if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
});

if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("show");
        menuBtn.classList.toggle("active");
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("show");
            menuBtn.classList.remove("active");
        });
    });
}

if (topBtn) {
    topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ===============================
   THEME TOGGLE
============================== */

const themeBtn = $("#themeToggle");
let darkMode = true;

function setTheme(mode) {
    document.body.classList.toggle("light", mode === "light");
    darkMode = mode !== "light";
    if (themeBtn) {
        themeBtn.innerHTML = darkMode
            ? '<i class="fa-solid fa-moon"></i>'
            : '<i class="fa-solid fa-sun"></i>';
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
}

if (themeBtn) {
    themeBtn.addEventListener("click", () => setTheme(darkMode ? "light" : "dark"));
}
setTheme(localStorage.getItem("theme") || "dark");

/* ===============================
   COUNTERS & SKILL BARS
============================== */

const counters = $$(".counter");
const bars = $$(".bar");

if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = Number(el.dataset.target || 0);
            let value = 0;
            const step = Math.max(1, target / 90);

            const run = () => {
                value += step;
                if (value < target) {
                    el.textContent = Math.floor(value);
                    requestAnimationFrame(run);
                } else {
                    el.textContent = target;
                }
            };
            run();
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.4 });

    counters.forEach((counter) => counterObserver.observe(counter));

    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            bar.style.width = bar.dataset.width || bar.style.width || "80%";
            barObserver.unobserve(bar);
        });
    }, { threshold: 0.35 });

    bars.forEach((bar) => {
        if (!bar.dataset.width) {
            if (bar.classList.contains("html")) bar.dataset.width = "95%";
            else if (bar.classList.contains("css")) bar.dataset.width = "92%";
            else if (bar.classList.contains("js")) bar.dataset.width = "88%";
            else bar.dataset.width = "85%";
        }
        bar.style.width = "0";
        barObserver.observe(bar);
    });
}

/* ===============================
   SCROLL REVEAL
============================== */

const revealTargets = $$(".glass-card,.project-card,.service-card,.contact-card,.gallery-item,.stat-box,.about-image img");
if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }
        });
    }, { threshold: 0.14 });

    revealTargets.forEach((el) => {
        el.classList.add("hidden");
        revealObserver.observe(el);
    });
}

/* ===============================
   TOAST / COPY BANK / QR
============================== */

const copyBtn = $("#copyBank");
if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
        const text = CONFIG.bank?.accountNumber || "0123456789990";
        try {
            await navigator.clipboard.writeText(text);
            showToast("Đã sao chép số tài khoản");
        } catch {
            showToast("Không thể sao chép");
        }
    });
}

const qrModal = $("#qrModal");
const showQR = $("#showQR");
const closeQR = $("#closeQR");

if (showQR && qrModal) {
    showQR.addEventListener("click", () => qrModal.classList.add("active"));
}
if (closeQR && qrModal) {
    closeQR.addEventListener("click", () => qrModal.classList.remove("active"));
}
window.addEventListener("click", (e) => {
    if (e.target === qrModal) qrModal.classList.remove("active");
});

/* ===============================
   PARTICLE CANVAS (PAGE)
============================== */

const canvas = $("#particles");
if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const count = window.innerWidth < 768 ? 42 : 72;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.9 + 0.5,
                dx: (Math.random() - 0.5) * 0.35,
                dy: (Math.random() - 0.5) * 0.35
            });
        }
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
            p.x += p.dx;
            p.y += p.dy;

            if (p.x < -10 || p.x > canvas.width + 10) p.dx *= -1;
            if (p.y < -10 || p.y > canvas.height + 10) p.dy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
            ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();
}

/* ===============================
   MUSIC PLAYER
============================== */

const musicAudio = $("#musicAudio");
const musicPlayer = $(".music-player");
const musicCover = $("#musicCover");
const musicTitle = $("#musicTitle");
const musicArtist = $("#musicArtist");
const musicCurrent = $("#musicCurrent");
const musicDuration = $("#musicDuration");
const musicProgress = $("#musicProgress");
const musicThumb = $("#musicThumb");
const musicTimeline = $("#musicTimeline");
const musicPlaylist = $("#musicPlaylist");
const musicPlay = $("#musicPlay");
const musicPrev = $("#musicPrev");
const musicNext = $("#musicNext");
const musicShuffle = $("#musicShuffle");
const musicRepeat = $("#musicRepeat");

const tracks = Array.isArray(CONFIG.tracks) ? CONFIG.tracks.map((t, index) => ({
    ...t,
    cover: t.cover || makeTrackCover(t, index)
})) : [];

const playerState = {
    index: 0,
    shuffle: false,
    repeat: false,
    playing: false
};

function setPlayerAccent(track) {
    if (!track) return;
    const colors = track.colors || ["#0ea5e9", "#7c3aed", "#22d3ee"];
    document.documentElement.style.setProperty("--music-accent-1", colors[0]);
    document.documentElement.style.setProperty("--music-accent-2", colors[1]);
    document.documentElement.style.setProperty("--music-accent-3", colors[2]);
}

function syncPlaylistActive() {
    $$("#musicPlaylist .playlist-item").forEach((item, idx) => {
        item.classList.toggle("active", idx === playerState.index);
    });
}

function renderPlaylist() {
    if (!musicPlaylist) return;
    musicPlaylist.innerHTML = "";
    tracks.forEach((track, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "playlist-item";
        item.innerHTML = `
            <span class="track-no">${pad(index + 1)}</span>
            <span class="track-text">
                <strong>${track.title}</strong>
                <small>${track.artist}</small>
            </span>
            <i class="fa-solid fa-play"></i>
        `;
        item.addEventListener("click", () => loadTrack(index, true));
        musicPlaylist.appendChild(item);
    });
    syncPlaylistActive();
}

function loadTrack(index, autoplay = false) {
    if (!tracks.length || !musicAudio) return;
    playerState.index = (index + tracks.length) % tracks.length;
    const track = tracks[playerState.index];

    musicAudio.src = track.audio;
    musicAudio.load();

    if (musicCover) musicCover.src = track.cover;
    if (musicTitle) musicTitle.textContent = track.title;
    if (musicArtist) musicArtist.textContent = track.artist;

    if (playerState.repeat) musicAudio.loop = true;
    else musicAudio.loop = false;

    setPlayerAccent(track);
    syncPlaylistActive();
    updateControls();

    if (autoplay) {
        playMusic();
    } else {
        updateProgressUI();
    }
}

function updateControls() {
    if (musicShuffle) musicShuffle.classList.toggle("active", playerState.shuffle);
    if (musicRepeat) musicRepeat.classList.toggle("active", playerState.repeat);
    if (musicPlayer) musicPlayer.classList.toggle("playing", playerState.playing);
    if (musicPlay) {
        musicPlay.innerHTML = playerState.playing
            ? '<i class="fa-solid fa-pause"></i>'
            : '<i class="fa-solid fa-play"></i>';
    }
}

function playMusic() {
    if (!musicAudio) return;
    musicAudio.play().then(() => {
        playerState.playing = true;
        updateControls();
    }).catch(() => {
        // Autoplay may be blocked; wait for user interaction.
    });
}

function pauseMusic() {
    if (!musicAudio) return;
    musicAudio.pause();
    playerState.playing = false;
    updateControls();
}

function nextTrack() {
    if (!tracks.length) return;
    if (playerState.shuffle) {
        let next = playerState.index;
        if (tracks.length > 1) {
            while (next === playerState.index) {
                next = Math.floor(Math.random() * tracks.length);
            }
        }
        loadTrack(next, true);
        return;
    }
    loadTrack(playerState.index + 1, true);
}

function prevTrack() {
    if (!tracks.length) return;
    if (playerState.shuffle) {
        let prev = playerState.index;
        if (tracks.length > 1) {
            while (prev === playerState.index) {
                prev = Math.floor(Math.random() * tracks.length);
            }
        }
        loadTrack(prev, true);
        return;
    }
    loadTrack(playerState.index - 1, true);
}

function updateProgressUI() {
    if (!musicAudio) return;
    const current = musicAudio.currentTime || 0;
    const duration = musicAudio.duration || 0;
    const percent = duration ? (current / duration) * 100 : 0;

    if (musicCurrent) musicCurrent.textContent = formatTime(current);
    if (musicDuration) musicDuration.textContent = formatTime(duration);
    if (musicProgress) musicProgress.style.width = `${percent}%`;
    if (musicThumb) musicThumb.style.left = `calc(${percent}% - 8px)`;
}

if (musicAudio) {
    musicAudio.addEventListener("timeupdate", updateProgressUI);
    musicAudio.addEventListener("loadedmetadata", updateProgressUI);
    musicAudio.addEventListener("play", () => {
        playerState.playing = true;
        updateControls();
    });
    musicAudio.addEventListener("pause", () => {
        playerState.playing = false;
        updateControls();
    });
    musicAudio.addEventListener("ended", () => {
        if (playerState.repeat) {
            musicAudio.currentTime = 0;
            playMusic();
        } else {
            nextTrack();
        }
    });
}

if (musicTimeline && musicAudio) {
    const seekTo = (clientX) => {
        const rect = musicTimeline.getBoundingClientRect();
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        if (Number.isFinite(musicAudio.duration)) {
            musicAudio.currentTime = ratio * musicAudio.duration;
        }
    };

    musicTimeline.addEventListener("click", (e) => seekTo(e.clientX));
    musicTimeline.addEventListener("touchstart", (e) => {
        if (!e.touches || !e.touches[0]) return;
        seekTo(e.touches[0].clientX);
    }, { passive: true });
}

if (musicPlay) {
    musicPlay.addEventListener("click", () => {
        if (playerState.playing) pauseMusic();
        else playMusic();
    });
}
if (musicNext) musicNext.addEventListener("click", nextTrack);
if (musicPrev) musicPrev.addEventListener("click", prevTrack);
if (musicShuffle) {
    musicShuffle.addEventListener("click", () => {
        playerState.shuffle = !playerState.shuffle;
        updateControls();
        showToast(playerState.shuffle ? "Đã bật Shuffle" : "Đã tắt Shuffle");
    });
}
if (musicRepeat) {
    musicRepeat.addEventListener("click", () => {
        playerState.repeat = !playerState.repeat;
        if (musicAudio) musicAudio.loop = playerState.repeat;
        updateControls();
        showToast(playerState.repeat ? "Đã bật Repeat" : "Đã tắt Repeat");
    });
}

renderPlaylist();
if (tracks.length) loadTrack(0, false);

/* ===============================
   GALLERY LIGHTBOX
============================== */

$$(".gallery-item img").forEach((img) => {
    img.addEventListener("click", () => {
        const lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.innerHTML = `
            <span class="lightbox-close">&times;</span>
            <img src="${img.src}" alt="${img.alt || "Preview"}">
        `;
        document.body.appendChild(lightbox);
        requestAnimationFrame(() => lightbox.classList.add("show"));
        lightbox.addEventListener("click", () => {
            lightbox.classList.remove("show");
            setTimeout(() => lightbox.remove(), 280);
        });
    });
});



/* ===============================
   BACKGROUND VIDEO FORCE-PLAY
============================== */

const bgVideo = $("#bg-video");

function ensureBackgroundVideo() {
    if (!bgVideo) return;
    try {
        bgVideo.muted = true;
        bgVideo.defaultMuted = true;
        bgVideo.playsInline = true;
        bgVideo.autoplay = true;
        bgVideo.loop = true;
        bgVideo.preload = "auto";
        const attempt = () => {
            const playPromise = bgVideo.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        };
        bgVideo.addEventListener("loadeddata", attempt, { once: true });
        bgVideo.addEventListener("canplay", attempt, { once: true });
        bgVideo.addEventListener("error", () => {
            // Silent fallback; the page still works if the browser can't decode the file.
        });
        window.addEventListener("load", attempt, { once: true });
        document.addEventListener("click", attempt, { once: true, passive: true });
        document.addEventListener("touchstart", attempt, { once: true, passive: true });
        setTimeout(attempt, 600);
        setTimeout(attempt, 1800);
    } catch (error) {
        // Ignore and keep the fallback background.
    }
}
ensureBackgroundVideo();


/* ===============================
   YEAR AUTO
============================== */

const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

/* ===============================
   PERFORMANCE LOG
============================== */

window.addEventListener("pageshow", () => {
    console.log("BlueBlack Premium V7 Loaded.");
});