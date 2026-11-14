# Birthday Surprise (HTML + CSS + Vanilla JS)

No build step, no npm, no React. GSAP and Lenis load from a CDN.

## Run
Open with a local server (recommended so audio/images load reliably):
    python3 -m http.server 8000      # then visit http://localhost:8000
(or use the VS Code "Live Server" extension). Needs internet for the CDN libraries and Google Fonts.

## Structure
index.html          markup for all 7 sections
css/style.css       theme + layout + responsive
js/script.js        CONFIG (edit here), DOM building, canvas effects, lightbox, music
js/animations.js    GSAP, ScrollTrigger, Lenis, slideshow, gift sequence
images/slides/      slide1.jpg ... slide4.jpg   (hero cinematic slideshow)
images/memories/    01.jpg ... 06.jpg           (gallery)
audio/music.mp3     optional background music

## Personalise
Everything personal is in the CONFIG block at the top of js/script.js:
name, your name, photo paths, captions, wishes, gift messages.
Missing photos show an elegant placeholder instead of a broken icon.
