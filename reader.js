/* DOMiNANCE reader experience: continuous by default; optional focused modes. */
(() => {
'use strict';
const main=document.getElementById('main');
if(!main)return;
const allowed=['continuous','section','presentation'];
const safe=(key,fallback,values)=>{try{const x=localStorage.getItem(key);return values.includes(x)?x:fallback}catch{return fallback}};
let mode=safe('dom-reader-mode','continuous',allowed);
let scale=Number(safe('dom-reader-scale','100',['90','100','110','120']));
let width=safe('dom-reader-width','comfortable',['comfortable','wide']);
let currentSlug='',sections=[],activeSection=0,article=null,rendering=false;
const save=(key,value)=>{try{localStorage.setItem(key,String(value))}catch{}};
function findSlug(){return(location.hash.split('?')[0].split('/')[3]||'')}
function setClasses(){
 document.documentElement.dataset.readerScale=String(scale);
 document.documentElement.dataset.readerWidth=width;
 document.documentElement.dataset.readerMode=mode;
}
function getSections(){
 const root=article.querySelector('.article-text');
 if(!root)return[];
 const children=[...root.children], groups=[];
 let current=null;
 for(const node of children){
   if(node.tagName==='H2'){
     current={heading:node,nodes:[node],name:node.textContent.trim()};
     groups.push(current);
   }else if(current){current.nodes.push(node)}
   else{
     if(!groups.length)groups.push({heading:null,nodes:[],name:'Introduction'});
     groups[0].nodes.push(node)
   }
 }
 return groups;
}
function showSection(index){
 if(!sections.length)return;
 activeSection=Math.max(0,Math.min(index,sections.length-1));
 sections.forEach((s,i)=>s.nodes.forEach(n=>{n.hidden=mode!=='continuous'&&i!==activeSection}));
 const tracker=main.querySelector('#reader-position');
 if(tracker)tracker.textContent=`Section ${activeSection+1} of ${sections.length}`;
 const previous=main.querySelector('#reader-prev'),next=main.querySelector('#reader-next');
 if(previous)previous.disabled=activeSection===0;
 if(next)next.disabled=activeSection===sections.length-1;
 const picker=main.querySelector('#sections-select');
 if(picker&&sections[activeSection].heading?.id)picker.value=sections[activeSection].heading.id;
 save('dom-last-section-'+currentSlug,activeSection);
}
function selectMode(newMode){
 mode=newMode;save('dom-reader-mode',mode);setClasses();
 main.querySelectorAll('[data-reader-mode]').forEach(button=>{const chosen=button.dataset.readerMode===mode;button.setAttribute('aria-pressed',String(chosen));});
 const nav=main.querySelector('#reader-section-nav');
 if(article) article.setAttribute('aria-label',mode==='presentation'?'Focused presentation reading':'Chapter reading');
 if(nav)nav.hidden=mode==='continuous';
 if(mode==='continuous'){
   sections.forEach(s=>s.nodes.forEach(n=>{n.hidden=false}));
 }else showSection(activeSection);
}
function go(index){
 showSection(index);
 article.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
function mount(){
 if(rendering)return;
 const next=main.querySelector('.article-sheet');
 if(!next){article=null;currentSlug='';return}
 const slug=findSlug();
 if(next===article&&slug===currentSlug)return;
 rendering=true;
 article=next;currentSlug=slug;
 const toolbar=document.createElement('div');
 toolbar.className='reader-toolbar';
 toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Reading preferences');
 toolbar.innerHTML=`<div class="reader-modes" role="group" aria-label="Reading mode"><button type="button" data-reader-mode="continuous">Continuous</button><button type="button" data-reader-mode="section">Sections</button><button type="button" data-reader-mode="presentation">Cards</button></div><div class="reader-adjust"><label for="reader-size">Text size</label><select id="reader-size" aria-label="Reading text size"><option value="90">Small</option><option value="100">Normal</option><option value="110">Large</option><option value="120">Extra large</option></select><label for="reader-width">Line width</label><select id="reader-width" aria-label="Reading line width"><option value="comfortable">Comfortable</option><option value="wide">Wide</option></select></div>`;
 article.querySelector('.article-summary')?.after(toolbar);
 const nav=document.createElement('nav');nav.id='reader-section-nav';nav.className='reader-section-nav';
 nav.setAttribute('aria-label','Section reading navigation');
 nav.innerHTML='<button type="button" id="reader-prev">← Previous</button><span id="reader-position" aria-live="polite"></span><button type="button" id="reader-next">Next →</button>';
 article.querySelector('.article-text')?.after(nav);
 sections=getSections();
 const saved=Number(safe('dom-last-section-'+slug,'0',Array.from({length:sections.length},(_,i)=>String(i))));
 activeSection=Number.isInteger(saved)?saved:0;
 toolbar.querySelectorAll('[data-reader-mode]').forEach(button=>button.addEventListener('click',()=>selectMode(button.dataset.readerMode)));
 const size=toolbar.querySelector('#reader-size');size.value=String(scale);
 size.addEventListener('change',()=>{scale=Number(size.value);save('dom-reader-scale',scale);setClasses()});
 const lineWidth=toolbar.querySelector('#reader-width');lineWidth.value=width;
 lineWidth.addEventListener('change',()=>{width=lineWidth.value;save('dom-reader-width',width);setClasses()});
 nav.querySelector('#reader-prev').addEventListener('click',()=>go(activeSection-1));
 nav.querySelector('#reader-next').addEventListener('click',()=>go(activeSection+1));
 article.addEventListener('keydown',event=>{
   if(mode!=='presentation'||event.altKey||event.ctrlKey||event.metaKey||/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(event.target.tagName))return;
   if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();if(activeSection<sections.length-1)go(activeSection+1)}
   if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();if(activeSection>0)go(activeSection-1)}
 });
 main.querySelector('#sections-select')?.addEventListener('change',event=>{
   if(mode==='continuous')return;
   const index=sections.findIndex(s=>s.heading?.id===event.target.value);
   if(index>=0)go(index);
 });
 main.querySelectorAll('[data-scroll]').forEach(link=>link.addEventListener('click',()=>{
   if(mode==='continuous')return;
   const index=sections.findIndex(s=>s.heading?.id===link.dataset.scroll);
   if(index>=0)showSection(index);
 },true));
 selectMode(mode);setClasses();
 rendering=false;
}
setClasses();
const observer=new MutationObserver(()=>{if(!rendering)mount()});
observer.observe(main,{childList:true});
mount();
})();