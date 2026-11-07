/* DOMiNANCE media resources: no videos or animations load until requested. */
(() => {
  'use strict';
  const main = document.getElementById('main');
  if (!main) return;
  const phone = matchMedia('(max-width: 760px), (pointer: coarse) and (max-height: 520px)');   // phones, upright or sideways
  const videoSrc = (panel, autoplay) => {
    const id = panel.dataset.youtubeId;
    if (!/^[\w-]{11}$/.test(id || '')) return '';
    const start = /^\d{1,5}$/.test(panel.dataset.youtubeStart || '') ? '&start=' + panel.dataset.youtubeStart : '';
    return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0' + start + (autoplay ? '&autoplay=1' : '');
  };
  const frame = (src, title) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-label', 'Embedded educational video player');
    iframe.src = src;
    iframe.title = title || 'Optional educational video';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    return iframe;
  };

  const escHtml = t => String(t || '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const creditLine = panel => {
    const url = /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}(&amp;|&)?[\w=&;]*$/.test(panel.dataset.url || '') ? panel.dataset.url : '';
    return escHtml(panel.dataset.credit || '') + (url ? `${panel.dataset.credit ? ' · ' : ''}<a href="${url}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>` : '');
  };
  // ---------- phones: the video opens in its own full-screen window ----------
  let viewer = null, viewerFrom = null;
  function closeVideo(fromHistory = false) {
    if (!viewer) return;
    viewer.remove(); viewer = null;
    document.documentElement.classList.remove('video-open');
    viewerFrom?.focus({preventScroll: true}); viewerFrom = null;
    if (!fromHistory && history.state?.domSheet === 'video') history.back();
  }
  function openVideo(panel, play) {
    const src = videoSrc(panel, true);
    if (!src) return;
    closeVideo(true);
    viewerFrom = play;
    viewer = document.createElement('div');
    viewer.className = 'video-viewer';
    viewer.setAttribute('role', 'dialog'); viewer.setAttribute('aria-modal', 'true'); viewer.setAttribute('aria-label', panel.dataset.mediaTitle || 'Educational video');
    const title = panel.querySelector('.vc-title, h3')?.textContent.trim() || panel.dataset.mediaTitle || 'Video';
    viewer.innerHTML = '<div class="vv-head"><p class="vv-title"></p><button type="button" class="vv-close" aria-label="Close the video">✕</button></div>' +
      '<div class="vv-stage"></div><div class="vv-foot"><p class="vv-hint">Turn your phone sideways for a bigger picture.</p><p class="vv-credit"></p></div>';
    viewer.querySelector('.vv-title').textContent = title;
    viewer.querySelector('.vv-credit').innerHTML = creditLine(panel);
    viewer.querySelector('.vv-stage').append(frame(src, panel.dataset.mediaTitle));
    viewer.addEventListener('click', e => { if (e.target === viewer || e.target.closest('.vv-close')) closeVideo(); });
    viewer.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeVideo(); }
      if (e.key === 'Tab') { e.preventDefault(); viewer.querySelector(document.activeElement === viewer.querySelector('.vv-close') ? 'iframe' : '.vv-close').focus(); }
    });
    document.body.append(viewer);
    document.documentElement.classList.add('video-open');
    try { history.pushState({domSheet: 'video'}, ''); } catch { /* back button closes nothing */ }
    viewer.querySelector('.vv-close').focus({preventScroll: true});
  }
  window.addEventListener('popstate', () => closeVideo(true));
  window.addEventListener('hashchange', () => closeVideo(true));

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
      const mp3 = panel.dataset.audioMp3;
      if (mp3 && /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/transcoded\/[a-z0-9/_.-]+\.mp3$/i.test(mp3)) {
        const mpeg = document.createElement('source');
        mpeg.src = mp3;
        mpeg.type = 'audio/mpeg';
        audio.appendChild(mpeg);
      }
      const ogg = document.createElement('source');
      ogg.src = url;
      ogg.type = 'audio/ogg';
      audio.appendChild(ogg);
      audio.setAttribute('aria-label', panel.dataset.mediaTitle || 'Heart-sound recording');
      audio.volume = 1;
      audio.playbackRate = 1;
      audio.addEventListener('error', () => {
        const status = panel.querySelector('.audio-status') || document.createElement('p');
        status.className = 'audio-status';
        status.setAttribute('role','status');
        status.textContent = 'The recording could not load. Use the alternative playback link above, or check your internet connection.';
        if (!status.parentNode) stage.appendChild(status);
      });
      stage.appendChild(audio);
      const speed = document.createElement('label');
      speed.className = 'audio-speed-control';
      speed.textContent = 'Playback speed ';
      const select = document.createElement('select');
      select.setAttribute('aria-label','Heart recording speed');
      [['0.85','Slower'],['1','Normal'],['1.15','Faster']].forEach(([value,label])=>{
        const opt=document.createElement('option');opt.value=value;opt.textContent=label;select.appendChild(opt);
      });
      select.value='1';
      select.addEventListener('change',()=>{audio.playbackRate=Number(select.value)});
      speed.appendChild(select);
      stage.appendChild(speed);
      panel.classList.add('is-playing');
      play.textContent = 'Close recording';
      play.dataset.mediaAction = 'stop-audio';
      play.setAttribute('aria-expanded', 'true');
      audio.play().catch(() => {});
    } else if (action === 'stop-audio') {
      stage.querySelector('audio')?.pause();
      stage.replaceChildren();
      panel.classList.remove('is-playing');
      play.textContent = 'Listen to clearer recording';
      play.dataset.mediaAction = 'play-audio';
      play.setAttribute('aria-expanded', 'false');
    } else if (action === 'play-video') {
      if (phone.matches) { openVideo(panel, play); return; }
      const src = videoSrc(panel, true);
      if (!src) return;
      const iframe = frame(src, panel.dataset.mediaTitle);
      const bar = document.createElement('div');
      bar.className = 'vc-bar';
      bar.innerHTML = `<p class="vc-credit">${creditLine(panel)}</p><button type="button" class="vc-close" data-media-action="stop-video">Close video</button>`;
      stage.replaceChildren(iframe, bar);
      panel.classList.add('is-playing');
      panel.querySelector('.video-card')?.setAttribute('aria-expanded', 'true');
      bar.querySelector('.vc-close').focus({preventScroll: true});
    } else if (action === 'stop-video') {
      stage.replaceChildren();
      panel.classList.remove('is-playing');
      const card = panel.querySelector('.video-card');
      card?.setAttribute('aria-expanded', 'false');
      card?.focus({preventScroll: true});
    } else if (action === 'play-animation') {
      const url = panel.dataset.animationSrc;
      if (!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-z0-9/_.-]+\.gif$/i.test(url || '')) return;
      stage.replaceChildren();
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        stage.textContent='Animation is paused because reduced motion is enabled on this device. You may turn off reduced motion in device settings to view this GIF.';
        stage.setAttribute('role','status');
        return;
      }
      stage.removeAttribute('role');
      const img = document.createElement('img');
      img.src = url;
      img.alt = panel.dataset.mediaAlt || 'Animated cardiac physiology teaching diagram';
      img.decoding = 'async';
      img.loading = 'lazy';
      stage.appendChild(img);
      panel.classList.add('is-playing');
      play.textContent = 'Stop animation';
      play.dataset.mediaAction = 'stop-animation';
      play.setAttribute('aria-expanded', 'true');
    } else if (action === 'stop-animation') {
      stage.replaceChildren();
      stage.removeAttribute('role');
      panel.classList.remove('is-playing');
      play.textContent = 'Play animation';
      play.dataset.mediaAction = 'play-animation';
      play.setAttribute('aria-expanded', 'false');
    }
  });
})();
