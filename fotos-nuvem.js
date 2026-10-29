/* =====================================================
   FOTOS NA NUVEM (29/10/2026) — o mesmo da Yalla (v1.9.0, FOTOS-YALLA.sql)

   Ele montou um orçamento e as fotos dos passeios não apareceram. As capas
   que a Dulcineia trocou no painel ficavam DENTRO do catálogo, como texto
   (data:…), e a proposta não leva esse formato (não cabe no link do
   cliente). E o catálogo com as 8 capas pesava 1,7 MB — todo visitante do
   site baixava isso para ver a vitrine.

   Agora:
   1. toda foto escolhida no painel (capa, parada, foto de abertura,
      retrato, foto do orçamento) sobe para a pasta da sala no Storage
      (dulcineia-fotos: leitura pública, só a dona grava) e o app guarda só
      o endereço — em 1600 px, porque não pesa mais no catálogo;
   2. as fotos antigas (data:) mudam sozinhas para a pasta na primeira vez
      que ela abre o painel logada, uma por uma, sem mexer em mais nada;
   3. sem nuvem, sem login ou sem a pasta (FOTOS-DULCINEIA.sql ainda não
      rodado): tudo como antes, a foto reduzida fica no catálogo — nunca
      perde a foto.
   ===================================================== */
const FN_LADO = 1600, FN_Q = 0.84;
const fnEhData = (s) => /^data:image\//.test(String(s || ''));
const fnBalde = () => { const s = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.sala) || ''; return (s ? s + '-' : '') + 'fotos'; };
const fnPode = () => typeof SUPA_URL !== 'undefined' && !!SUPA_URL && typeof isLoggedIn === 'function' && isLoggedIn();

function fnImg(src) { return new Promise((ok, falha) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => falha(new Error('foto ilegível')); i.src = src; }); }
async function fnBlob(src) {
  const img = await fnImg(src), k = Math.min(1, FN_LADO / Math.max(img.width, img.height)), c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(ok => c.toBlob(ok, 'image/jpeg', FN_Q));
}
/* sobe e devolve o endereço público; '' se não deu (sem login, sem a pasta, sem rede) */
async function fnSobe(src, pasta) {
  if (!fnPode()) return '';
  try {
    if (typeof authEnsure === 'function') await authEnsure();   /* login vencido: renova antes */
    const blob = await fnBlob(src); if (!blob) return '';
    const nome = String(pasta || 'geral').replace(/[^a-z0-9-]/gi, '').slice(0, 40) + '/' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
    const r = await fetch(SUPA_URL + '/storage/v1/object/' + fnBalde() + '/' + nome, { method: 'POST',
      headers: { apikey: SUPA_KEY, authorization: 'Bearer ' + authToken(), 'content-type': 'image/jpeg' }, body: blob });
    return r.ok ? SUPA_URL + '/storage/v1/object/public/' + fnBalde() + '/' + nome : '';
  } catch (e) { return ''; }
}
/* o que já é endereço (fotos/…, https://…) passa direto */
async function fotoNaNuvem(src, pasta) {
  if (!fnEhData(src)) return src;
  return (await fnSobe(src, pasta)) || src;
}

/* 1. as fotos novas: o mesmo readImageResized de sempre, mas o resultado é o endereço na pasta */
if (typeof readImageResized === 'function') {
  const _readImageResized = readImageResized;
  readImageResized = async function (file, maxW, quality) {
    const leve = await _readImageResized(file, maxW, quality);   /* confere que é foto; e é a reserva */
    if (!fnPode()) return leve;
    if (typeof toast === 'function') toast('Enviando a foto…');
    const u = URL.createObjectURL(file);
    try { return (await fnSobe(u, 'painel')) || leve; } finally { URL.revokeObjectURL(u); }
  };
}

/* 2. as fotos antigas: uma por uma, e só troca se ninguém mexeu nela enquanto subia */
let fnMigrou = false, fnRodando = false;
async function fotosMigra() {
  if (fnMigrou || fnRodando || !fnPode() || typeof DB === 'undefined' || !DB || !Array.isArray(DB.tours)) return;
  if (typeof nuvemJaCarregada !== 'undefined' && !nuvemJaCarregada) return;   /* primeiro o catálogo da nuvem */
  /* capa que ela subiu (data:) é dela: o crédito da foto antiga da Wikimedia não vale (achado 29/10) */
  let creditos = 0;
  for (const x of DB.tours) if (fnEhData(x.photo) && x.photoCr) { x.photoCr = ''; creditos++; }
  const alvos = [], capaNova = new Set();
  for (const x of DB.tours) {
    if (fnEhData(x.photo)) { const src = x.photo; alvos.push({ src, pasta: x.id, poe: (url) => { const y = Tours.get(x.id); if (y && y.photo === src) { y.photo = url; capaNova.add(x.id); return true; } } }); }
    (x.stops || []).forEach((p, k) => { if (p && fnEhData(p.ph)) { const src = p.ph; alvos.push({ src, pasta: x.id, poe: (url) => { const y = Tours.get(x.id), q = y && (y.stops || []).find(s => s && s.ph === src); if (q) { q.ph = url; return true; } } }); } });
    (x.fotos || []).forEach((f) => { if (fnEhData(f)) alvos.push({ src: f, pasta: x.id, poe: (url) => { const y = Tours.get(x.id), k = y && (y.fotos || []).indexOf(f); if (k >= 0) { y.fotos[k] = url; return true; } } }); });
  }
  for (const k of ['photo', 'homePhoto']) if (fnEhData(DB.settings[k])) { const src = DB.settings[k]; alvos.push({ src, pasta: 'site', poe: (url) => { if (DB.settings[k] === src) { DB.settings[k] = url; return true; } } }); }
  if (!alvos.length) { if (creditos) save(); fnMigrou = true; return; }
  fnRodando = true;
  let feitas = 0;
  try {
    for (const a of alvos) {
      const url = await fnSobe(a.src, a.pasta);
      if (!url) break;                       /* sem a pasta ou sem rede: tenta de novo da próxima vez */
      if (a.poe(url)) feitas++;
    }
    /* o orçamento montado antes não tinha foto nenhuma para escolher: o serviço sem foto ganha a capa */
    for (const o of DB.orcamentos || []) for (const i of o.itens || []) if (!i.foto && capaNova.has(i.tourId)) i.foto = (Tours.get(i.tourId) || {}).photo || '';
    if (feitas || creditos) save();
    if (feitas === alvos.length) fnMigrou = true;
  } finally { fnRodando = false; }
}
/* roda alguns segundos depois de abrir o painel (a nuvem já leu) */
function fnAgenda() { if (/^#\/adm/.test(location.hash) && !fnMigrou) setTimeout(fotosMigra, 6000); }
addEventListener('hashchange', fnAgenda);
fnAgenda();
