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
 dialog.append(close,image,caption);document.body.append(dialog);
 let lastTrigger=null;
 const shut=()=>{if(dialog.open)dialog.close()};
 close.addEventListener('click',shut);
 dialog.addEventListener('click',e=>{if(e.target===dialog)shut()});
 dialog.addEventListener('close',()=>{image.removeAttribute('src');lastTrigger?.focus?.();lastTrigger=null});
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
 const observer=new MutationObserver(enhance);
 observer.observe(main,{childList:true,subtree:true});
 enhance();
 main.addEventListener('click',e=>{
  const btn=e.target.closest?.('.figure-zoom');
  if(btn&&main.contains(btn)){e.preventDefault();show(btn)}
 });
})();