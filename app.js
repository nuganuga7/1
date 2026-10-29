import {matchesProduct, parseSaleEnd, countdownText, safeOrderUrl, safeImageUrl, validCatalog} from './catalog-utils.mjs';
const $ = id => document.getElementById(id);
const dialog = $('product-dialog');
let products = [], settings = {}, interval;
const ns = 'http://www.w3.org/2000/svg';
const referenceViews = {persimmon:'34 158 272 90', peach:'965 158 272 247', melon:'655 158 272 75'};
function placeholder(photo) { photo.replaceChildren(); const text = document.createElement('span');text.className='placeholder';text.textContent='상품 사진 준비 중';photo.append(text); }
function productCard(p) {
  const button = document.createElement('button');button.className='card';button.type='button';button.setAttribute('aria-label', `${p.name} ${p.description} ${p.price}${p.status==='soldout'?' 품절':''} 상세 보기`);
  const photo = document.createElement('span');photo.className='photo';
  const src = safeImageUrl(p.image, document.baseURI);
  if(src) { const img = document.createElement('img');img.src=src;img.alt=p.name;img.loading='lazy';img.addEventListener('error',()=>placeholder(photo));photo.append(img); }
  else if(referenceViews[p.reference]) {
    const svg = document.createElementNS(ns,'svg');svg.setAttribute('viewBox',referenceViews[p.reference]);svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.setAttribute('aria-hidden','true');
    const img = document.createElementNS(ns,'image');img.setAttribute('href','assets/reference.png');img.setAttribute('width','1304');img.setAttribute('height','726');svg.append(img);photo.append(svg);
  } else placeholder(photo);
  if(p.status==='soldout') {const badge=document.createElement('span');badge.className='badge';badge.textContent='품절';photo.append(badge);}
  button.append(photo);
  const body = document.createElement('span');body.className='card-body';
  for(const [cls,text] of [['card-name',p.name],['card-info',p.description],['card-price',p.price]]) {const e=document.createElement('span');e.className=cls;e.textContent=text;body.append(e);}
  button.append(body);button.addEventListener('click',()=>openProduct(p));return button;
}
function openProduct(p) {
  $('product-title').textContent=p.name;$('product-description').textContent=p.description;$('product-price').textContent=p.price;
  const url = p.status==='selling' ? safeOrderUrl(p.orderUrl) : '';
  $('product-buy').hidden=!url;
  if(url) $('product-buy').href=url; else $('product-buy').removeAttribute('href');
  $('product-notice').textContent=p.status==='soldout'?'현재 품절된 상품입니다.':url?'주문 버튼을 누르면 외부 판매 페이지로 이동합니다.':'이 상품은 온라인 주문을 준비 중입니다.';
  dialog.showModal();
}
function render() {
  const query=$('search-input').value.trim();
  const visible=products.filter(p=>p.status!=='hidden' && matchesProduct(p,query));
  $('catalog').replaceChildren(...visible.map(productCard));
  const sale=visible.filter(p=>p.timeSale===true);
  $('sale-section').hidden=!(settings.saleEnabled===true && sale.length>0);
  $('sale-products').replaceChildren(...sale.map(productCard));
  $('search-empty').hidden=visible.length>0;
  $('search-empty').textContent=query?'검색 결과가 없습니다. 다른 상품명을 입력해 주세요.':'현재 진열 중인 상품이 없습니다.';
  $('search-status').textContent=query?`“${query}” 검색 결과: ${visible.length}개 상품`:'상품명으로 검색해 보세요. 예: 대봉, 복숭아, 멜론';
  $('search-reset').hidden=!query;
}
function startTimer() {
  clearInterval(interval);
  const end=parseSaleEnd(settings.saleEnd);
  $('sale-end').textContent=Number.isFinite(end)?settings.saleEnd:'종료 시간을 확인해 주세요';
  if(Number.isFinite(end)) $('sale-end').dateTime=settings.saleEnd.replace(' ','T')+':00+09:00';
  function tick() {const text=countdownText(end,Date.now());$('countdown').textContent=text;$('countdown-label').textContent=text==='종료'?'타임세일':'남은 시간';if(text==='종료'||!Number.isFinite(end)) clearInterval(interval);}
  tick();if(Number.isFinite(end)&&end>Date.now()) interval=setInterval(tick,1000);
}
async function load() {
  $('search-status').textContent='상품을 불러오는 중입니다…';
  try {
    const data=await Promise.all(['settings','products'].map(async name=>{const r=await fetch(`data/${name}.json`,{cache:'no-store'});if(!r.ok)throw new Error('load');return r.json();}));
    if(!data[0]||typeof data[0].title!=='string'||!validCatalog(data[1]))throw new Error('schema');
    [settings,products]=data;$('site-title').textContent=settings.title;document.title=settings.title;$('site-notice').textContent=String(settings.notice||'');render();startTimer();
  } catch {
    $('search-status').textContent='상품 정보를 불러오지 못했습니다.';
    const retry=document.createElement('button');retry.className='error-retry';retry.textContent='다시 시도';retry.type='button';retry.addEventListener('click',load);$('search-status').append(retry);
  }
}
$('search-form').addEventListener('submit',e=>{e.preventDefault();render();});
$('search-input').addEventListener('input',()=>{if(!$('search-input').value)render();});
$('search-reset').addEventListener('click',()=>{$('search-input').value='';render();$('search-input').focus();});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
load();
