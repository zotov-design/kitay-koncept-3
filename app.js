const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 639px)');
// Content stays visible without JS; only enhance after observers are available.
const revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('is-pending');revealObserver.unobserve(entry.target)}},{threshold:.12,rootMargin:'0px 0px -24px 0px'});
if(!reduced.matches)for(const el of $$('.reveal')){el.classList.add('is-pending');revealObserver.observe(el)}
reduced.addEventListener('change',()=>{if(reduced.matches){for(const el of $$('.is-pending'))el.classList.remove('is-pending');revealObserver.disconnect()}updateScene()});

const hero=$('.hero');let frame=0,heroVisible=true;
function updateScene(){frame=0;const rect=hero.getBoundingClientRect();const p=Math.min(1,Math.max(0,-rect.top/rect.height));const gentle=mobile.matches?.42:1;const enabled=!reduced.matches;hero.style.setProperty('--cloud-y',enabled?`${-p*180*gentle}px`:'0px');hero.style.setProperty('--cloud-x',enabled?`${p*90*gentle}px`:'0px');hero.style.setProperty('--scene-y',enabled?`${p*65*gentle}px`:'0px');hero.style.setProperty('--copy-y',enabled?`${p*35*gentle}px`:'0px')}
function scheduleScene(){if(heroVisible&&!frame)frame=requestAnimationFrame(updateScene)}
const heroObserver=new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;document.documentElement.classList.toggle('motion-paused',!heroVisible||document.hidden);if(heroVisible)scheduleScene()});heroObserver.observe(hero);
addEventListener('scroll',scheduleScene,{passive:true});addEventListener('resize',scheduleScene,{passive:true});document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('motion-paused',document.hidden||!heroVisible));

const toggle=$('.menu-toggle'),menu=$('#mobile-menu');
function setMenu(open,restore=false){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');if(restore)toggle.focus()}
toggle.addEventListener('click',()=>setMenu(menu.hidden));
menu.addEventListener('click',e=>{if(e.target.closest('a,button'))setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)setMenu(false,true)});
document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('.site-header'))setMenu(false)});
menu.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const links=$$('a,button',menu);if(!e.shiftKey&&e.target===links.at(-1)){e.preventDefault();toggle.focus()}else if(e.shiftKey&&e.target===links[0]){e.preventDefault();toggle.focus()}});
matchMedia('(min-width:1200px)').addEventListener('change',e=>{if(e.matches)setMenu(false)});

const dialog=$('#detail-dialog'),title=$('#dialog-title'),content=$('#dialog-content');let returnFocus;
function openDetails(heading,paragraphs){returnFocus=document.activeElement;title.textContent=heading;content.replaceChildren(...paragraphs.map(text=>{const p=document.createElement('p');p.textContent=text;return p}));dialog.showModal()}
function closeDetails(){dialog.close()}
$('.dialog-close').addEventListener('click',closeDetails);$('.dialog-done').addEventListener('click',closeDetails);dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetails()}});
const info={Контакты:['Телефон в макете демонстрационный. Реальные контакты команды будут добавлены после согласования.','Это интерактивная концепция: страница не принимает заявки и не отправляет персональные данные.'],WhatsApp:['Ссылка на WhatsApp пока не предоставлена. Рабочий контакт будет подключён в следующем этапе.'],Telegram:['Ссылка на Telegram пока не предоставлена. Рабочий контакт будет подключён в следующем этапе.'],Отзывы:['Раздел отзывов будет доступен в полной версии сайта. Здесь представлены экраны концепции V3.'],Блог:['Материалы блога пока не предоставлены.'],Туристам:['Информация для путешественников будет добавлена после согласования содержания.'], 'О компании':['В этой концепции показаны организация путешествий, направления и примеры туров.','Текст о компании и подтверждённые данные команды будут добавлены в полной версии.']};
for(const button of $$('[data-info]'))button.addEventListener('click',()=>openDetails(button.dataset.info,info[button.dataset.info]));
for(const button of $$('[data-city]'))button.addEventListener('click',()=>openDetails(`${button.dataset.city} · ${button.dataset.service.toLowerCase()}`,['Это направление представлено в макете V3. Подробная программа, условия трансфера и реальные контакты будут добавлены после согласования.','Для просмотра примеров туров закройте окно и перейдите к разделу «Рекомендуем туры».']));
const tours=[['Пекин → Шанхай → Лоян','От 179 000 ₽'],['Шанхай','От 89 000 ₽'],['Сиань','От 65 000 ₽'],['Пекин → Шанхай → Лоян','От 179 000 ₽']];
for(const card of $$('[data-tour]'))card.addEventListener('click',()=>{const [name,price]=tours[card.dataset.tour];openDetails(name,[`${price} · 15 дней / 14 ночей`,'Название, длительность и цена перенесены из концепции Figma. Актуальные даты, состав программы и условия бронирования пока не предоставлены.','Это демонстрация интерфейса. Заявка и оплата здесь не оформляются.'])});

const sliders=new Map();
function setupSlider(name){const rail=$(`[data-slider="${name}"]`),pagination=$(`[data-pagination="${name}"]`);let tick=0;const state={rail,pagination,items:[],dots:[]};
 function current(){const first=state.items[0];if(!first)return 0;const target=rail.scrollLeft;return state.items.reduce((best,item,index)=>Math.abs(item.offsetLeft-first.offsetLeft-target)<Math.abs(state.items[best].offsetLeft-first.offsetLeft-target)?index:best,0)}
 function mark(){tick=0;const index=current();state.dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===index)))}
 function go(index){const item=state.items[index];if(item)rail.scrollTo({left:item.offsetLeft-state.items[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'})}
 function rebuild(){state.items=[...rail.children].filter(el=>getComputedStyle(el).display!=='none');pagination.replaceChildren();state.dots=state.items.map((item,i)=>{const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label',`${name==='tours'?'Тур':'Преимущество'} ${i+1} из ${state.items.length}`);dot.addEventListener('click',()=>go(i));pagination.append(dot);return dot});mark()}
 rail.addEventListener('scroll',()=>{if(!tick)tick=requestAnimationFrame(mark)},{passive:true});rail.addEventListener('keydown',e=>{if(e.target!==rail||!mobile.matches)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(Math.min(state.items.length-1,Math.max(0,current()+(e.key==='ArrowRight'?1:-1))))}});
 state.rebuild=rebuild;sliders.set(name,state);rebuild();mobile.addEventListener('change',rebuild);
}
setupSlider('benefits');setupSlider('tours');
const section=$('.tours'),showAll=$('#show-all'),extras=$$('.tour-extra');
function syncExtras(){const expanded=showAll.getAttribute('aria-expanded')==='true';for(const card of extras){card.inert=!expanded;card.setAttribute('aria-hidden',String(!expanded))}sliders.get('tours').rebuild()}
syncExtras();
showAll.addEventListener('click',()=>{const expanded=showAll.getAttribute('aria-expanded')!=='true';showAll.setAttribute('aria-expanded',String(expanded));section.classList.toggle('is-expanded',expanded);$('#show-all>span').textContent=expanded?'Свернуть':'Смотреть все';for(const card of extras)if(expanded)card.classList.remove('is-pending');syncExtras();$('#catalog-status').textContent=expanded?'Показаны все 8 карточек из концепции.':'Показаны первые 4 тура.';if(!expanded&&mobile.matches)sliders.get('tours').rail.scrollTo({left:0,behavior:'instant'})});
