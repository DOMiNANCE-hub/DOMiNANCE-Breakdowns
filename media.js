/* DOMiNANCE media resources: no videos or animations load until requested. */
(() => {
  'use strict';
  const main = document.getElementById('main');
  if (!main) return;

  main.addEventListener('click', event => {
    const play = event.target.closest?.('button[data-media-action]');
    if (!play || !main.contains(play)) return;
    const panel = play.closest('.media-resource');
    if (!panel) return;
    const stage = panel.querySelector('.media-stage');
    if (!stage) return;
    const action = play.dataset.mediaAction;

    if (action === 'play-audio') {
      const url = panel.dataset.audioSrc;
      if (!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:transcoded\/)?[a-z0-9/_.-]+\.(?:ogg|mp3)(?:\?download=)?$/i.test(url || '')) return;
      stage.replaceChildren();
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = url;
      audio.setAttribute('aria-label', panel.dataset.mediaTitle || 'Heart-sound recording');
      stage.appendChild(audio);
      panel.classList.add('is-playing');
      play.textContent = 'Close recording';
      play.dataset.mediaAction = 'stop-audio';
      play.setAttribute('aria-expanded', 'true');
      audio.play().catch(() => {});
    } else if (action === 'stop-audio') {
      stage.querySelector('audio')?.pause();
      stage.replaceChildren();
      panel.classList.remove('is-playing');
      play.textContent = 'Listen';
      play.dataset.mediaAction = 'play-audio';
      play.setAttribute('aria-expanded', 'false');
    } else if (action === 'play-video') {
      const id = panel.dataset.youtubeId;
      if (!/^[\w-]{11}$/.test(id || '')) return;
      stage.replaceChildren();
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
      iframe.title = panel.dataset.mediaTitle || 'Optional educational video';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.appendChild(iframe);
      panel.classList.add('is-playing');
      play.textContent = 'Close video';
      play.dataset.mediaAction = 'stop-video';
      play.setAttribute('aria-expanded', 'true');
    } else if (action === 'stop-video') {
      stage.replaceChildren();
      panel.classList.remove('is-playing');
      play.textContent = 'Watch video';
      play.dataset.mediaAction = 'play-video';
      play.setAttribute('aria-expanded', 'false');
    } else if (action === 'play-animation') {
      const url = panel.dataset.animationSrc;
      if (!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-z0-9/_.-]+\.gif$/i.test(url || '')) return;
      stage.replaceChildren();
      const img = document.createElement('img');
      img.src = url;
      img.alt = panel.dataset.mediaAlt || 'Animated cardiac physiology teaching diagram';
      img.decoding = 'async';
      stage.appendChild(img);
      panel.classList.add('is-playing');
      play.textContent = 'Stop animation';
      play.dataset.mediaAction = 'stop-animation';
      play.setAttribute('aria-expanded', 'true');
    } else if (action === 'stop-animation') {
      stage.replaceChildren();
      panel.classList.remove('is-playing');
      play.textContent = 'Play animation';
      play.dataset.mediaAction = 'play-animation';
      play.setAttribute('aria-expanded', 'false');
    }
  });
})();
