import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSaleEnd,countdownText,matchesProduct,safeOrderUrl,safeImageUrl,validCatalog} from '../catalog-utils.mjs';
import {readFileSync} from 'node:fs';
test('Korean time and invalid calendar dates',()=>{
  assert.equal(parseSaleEnd('2026-10-31 00:00'),Date.parse('2026-10-30T15:00:00Z'));
  for(const bad of ['2026-02-30 12:00','2026-13-01 00:00','2026-10-31 24:00','oops','']) assert.ok(Number.isNaN(parseSaleEnd(bad)));
});
test('countdown is fixed and expires without negative values',()=>{
  const end=parseSaleEnd('2026-10-31 00:00');
  assert.equal(countdownText(end,end-3661000),'01:01:01');
  assert.equal(countdownText(end,end+1000),'종료');assert.equal(countdownText(NaN,0),'시간 미설정');
});
test('search supports spacing and empty queries',()=>{
  const p={name:'겨울 복숭아',description:'2kg 6과'};
  assert.equal(matchesProduct(p,'복 숭 아'),true);assert.equal(matchesProduct(p,'2KG'),true);assert.equal(matchesProduct(p,'사과'),false);assert.equal(matchesProduct(p,''),true);
});
test('reject executable and credentialed order links',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,test','http://example.com','https://user:secret@example.com','/local'])assert.equal(safeOrderUrl(url),'');
  assert.equal(safeOrderUrl('https://smartstore.naver.com/example'),'https://smartstore.naver.com/example');
  assert.equal(safeImageUrl('/1/assets/uploads/photo.jpg','https://nuganuga7.github.io/1/'),'https://nuganuga7.github.io/1/assets/uploads/photo.jpg');
  assert.equal(safeImageUrl('javascript:alert(1)','https://nuganuga7.github.io/1/'),'');
});
test('initial data and CMS schema have supported values',()=>{
  const products=JSON.parse(readFileSync(new URL('../data/products.json',import.meta.url)));
  assert.equal(validCatalog(products),true);assert.equal(validCatalog([{}]),false);assert.equal(validCatalog([]),true);
  assert.equal(products.length,4);assert.equal(products.filter(p=>p.timeSale).length,1);
});
