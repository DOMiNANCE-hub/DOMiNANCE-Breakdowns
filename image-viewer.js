/* In-page figure viewer: source-credit links stay separate from image enlargement. */
(() => {
 'use strict';
 const main=document.getElementById('main');
 if(!main)return;
 const dialog=document.createElement('dialog');
 dialog.className='figure-viewer';
 dialog.setAttribute('aria-label','Enlarged teaching figure');
 const close=document.createElement('button');
 close.type='button';close.className='figure-viewer-close';close.textContent='Close ×';
 close.setAttribute('aria-label','Close enlarged figure');
 const image=document.createElement('img');image.alt='';image.decoding='async';
 const caption=document.createElement('p');caption.className='figure-viewer-caption';
 const stage=document.createElement('div');stage.className='figure-viewer-stage';stage.hidden=true;
 dialog.append(close,image,stage,caption);document.body.append(dialog);
 let lastTrigger=null;
 const shut=()=>{if(dialog.open)dialog.close()};
 close.addEventListener('click',shut);
 dialog.addEventListener('click',e=>{if(e.target===dialog)shut()});
 dialog.addEventListener('close',()=>{image.removeAttribute('src');image.hidden=false;stage.replaceChildren();stage.hidden=true;lastTrigger?.focus?.();lastTrigger=null});
 // Diagrams drawn as SVG (static figures and interactive widgets) open as a larger copy of what is on screen now.
 // The copy is drawn at least 1.25× its natural size, so on a phone it can be panned and read comfortably.
 function showDiagram(button){
   const fig=button.closest('figure');
   const svg=fig&&[...fig.querySelectorAll('svg')].find(x=>x.getBoundingClientRect().width>0);
   if(!svg)return;
   lastTrigger=button;
   const copy=svg.cloneNode(true);
   copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
   const vb=svg.viewBox&&svg.viewBox.baseVal;
   const natural=vb&&vb.width?vb.width:svg.getBoundingClientRect().width;
   copy.style.width='max(100%, '+Math.round(natural*1.25)+'px)';copy.style.height='auto';copy.style.maxHeight='none';
   image.hidden=true;stage.hidden=false;stage.replaceChildren(copy);
   const figCaption=fig.querySelector('figcaption');
   caption.textContent=figCaption?.childNodes?.[0]?.textContent?.trim()||'';
   if(typeof dialog.showModal==='function')dialog.showModal();
   stage.scrollLeft=0;
 }
 function show(button){
   const original=button.querySelector('img');
   if(!original)return;
   lastTrigger=button;
   image.src=original.currentSrc||original.src;
   image.alt=original.alt||'Enlarged teaching figure';
   const fig=button.closest('figure');
   const figCaption=fig?.querySelector('figcaption');
   caption.textContent=figCaption?.childNodes?.[0]?.textContent?.trim()||original.alt||'';
   if(typeof dialog.showModal==='function')dialog.showModal();
 }
 function enhance(){
  main.querySelectorAll('.article-text figure img').forEach(img=>{
   if(img.closest('.media-resource,.figure-zoom'))return;
   const anchor=img.closest('a');
   if(anchor&&anchor.closest('.figure-credit'))return;
   const button=document.createElement('button');
   button.type='button';button.className='figure-zoom';
   button.setAttribute('aria-label','Enlarge figure: '+(img.alt||'teaching diagram'));
   button.title='Tap or click to enlarge without leaving the chapter';
   if(anchor&&anchor.parentElement){anchor.replaceWith(button);button.append(img)}
   else {img.replaceWith(button);button.append(img)}
  });
 }
 function addDiagramButtons(){
  main.querySelectorAll('.article-text figure.learning-figure').forEach(fig=>{
   // Only drawings gain the button: interactive widgets and SVG figures, not HTML figures or the phone-first (dg) diagrams, which are already legible.
   if(fig.querySelector(':scope > .figure-enlarge')||fig.querySelector('img')||fig.classList.contains('dg-figure'))return;
   if(!fig.classList.contains('teaching-widget')&&!fig.querySelector('svg'))return;
   const b=document.createElement('button');
   b.type='button';b.className='figure-enlarge';b.textContent='⤢ Enlarge';
   b.setAttribute('aria-label','Enlarge diagram: '+((fig.querySelector('figcaption')?.textContent)||'teaching diagram').trim());
   const cap=fig.querySelector(':scope > figcaption');
   if(cap)cap.after(b);else fig.prepend(b);
  });
 }
 const enhanceAll=()=>{enhance();addDiagramButtons()};
 const observer=new MutationObserver(enhanceAll);
 observer.observe(main,{childList:true});// a new page replaces main's children
 enhanceAll();
 main.addEventListener('click',e=>{
  const btn=e.target.closest?.('.figure-zoom');
  if(btn&&main.contains(btn)){e.preventDefault();show(btn);return}
  const big=e.target.closest?.('.figure-enlarge');
  if(big&&main.contains(big)){e.preventDefault();showDiagram(big)}
 });
})();