/* =====================================================
   CRÉDITO DAS FOTOS (29/10/2026)

   As fotos de fotos/ são do Wikimedia Commons (lista com autor, licença e
   página em dados/fotos-commons.json). Todas permitem uso comercial, desde
   que a foto leve o crédito: autor, licença e o link da fonte (a CC 4.0
   pede o link). As fotos que a Dulcineia sobe são DELA e não levam crédito.

   Antes o crédito era um texto gravado junto do passeio (photoCr, cr): quando
   ela trocava a foto, o texto ficava — a capa dela aparecia como "Foto:
   Thomas Wolf · Wikimedia Commons". Agora o crédito sai da PRÓPRIA foto:
   foto daqui leva o crédito certo com link; qualquer outra, nenhum.
   ===================================================== */
const FOTO_FONTE = {
  "home-portao-noite": ["Thomas Wolf, www.foto-tw.de", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_nachts.jpg"],
  "portao": ["Thomas Wolf, www.foto-tw.de", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_morgens.jpg"],
  "reichstag": ["JoachimKohler-HB", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Kuppel_des_Reichstagsgeb%C3%A4udes_(Berlin,_2017).jpg"],
  "memorial-holocausto": ["Ad Meskens", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Memorial_to_the_Murdered_Jews_of_Europe_april_2025_06.jpg"],
  "muro-bernauer": ["Ansgar Koreng", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Mauergedenkst%C3%A4tte_Bernauer_Stra%C3%9Fe,_Berlin,_170514,_ako.jpg"],
  "gendarmenmarkt": ["Ansgar Koreng", "CC BY 3.0 de", "https://commons.wikimedia.org/wiki/File:Konzerthaus,_Gendarmenmarkt,_Berlin_(Blaue_Stunde).jpg"],
  "berliner-dom": ["MrBenjo", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Berliner_Dom_aus_Lustgarten.jpg"],
  "spree-panorama": ["ArildV", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Berlin_Mitte_June_2023_01.jpg"],
  "checkpoint": ["Gzen92", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Checkpoint_Charlie_-_%C3%A9criteau_(Berlin).jpg"],
  "sinagoga-cupulas": ["Carola Opitz", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Berlin,_Kuppeln_der_Synagoge_in_der_Oranienburger_Stra%C3%9Fe.JPG"],
  "sinagoga-rua": ["Ansgar Koreng", "CC BY-SA 3.0 de", "https://commons.wikimedia.org/wiki/File:Kuppel_der_neuen_Synagoge_in_Berlin.jpg"],
  "hackesche": ["Dietmar Rabich", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Berlin,_Hackesche_H%C3%B6fe_--_2011_--_2438.jpg"],
  "grosse-hamburger": ["Z thomas", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:J%C3%BCdischer_Friedhof_Berlin-Mitte_m%C3%A4rz2017_-_10.jpg"],
  "stolpersteine": ["Dietmar Rabich", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Berlin,_Stolpersteine_--_2013_--_4504.jpg"],
  "sanssouci": ["H. Zell", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Schloss_Sanssouci_Potsdam_-_Weinbergterrasse_01.jpg"],
  "bairro-holandes": ["Angel Miklashevsky", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Holl%C3%A4ndisches_Viertel,_Mittelstra%C3%9Fe,_Potsdam_3.jpg"],
  "cecilienhof": ["Ben Bender", "CC BY-SA 3.0", "https://commons.wikimedia.org/wiki/File:Potsdam,_Cecilienhof_-_panoramio_(1).jpg"],
  "glienicke": ["Torsten Henning", "Public domain", "https://commons.wikimedia.org/wiki/File:GlienickerBruecke_ty_20060908r0012645.jpg"],
  "sachsenhausen-torre": ["Mendeztrives", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Sachsenhausen_tower.jpg"],
  "sachsenhausen-campo": ["János Balázs from Berlin, Deutschland", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Memorial_concentration_camp_sachsenhausen_(8072107725).jpg"],
  "sachsenhausen-barracao": ["János Balázs from Berlin, Deutschland", "CC BY-SA 2.0", "https://commons.wikimedia.org/wiki/File:Memorial_concentration_camp_sachsenhausen_(8072098189).jpg"],
  "sachsenhausen-entrada": ["Christian Michelides", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Gedenkst%C3%A4tte_Sachsenhausen_01.jpg"],
  "oberbaum": ["Michielverbeek", "CC BY 4.0", "https://commons.wikimedia.org/wiki/File:Berlin-Kreuzberg,_de_torens_van_de_Oberbaumbr%C3%BCcke_Dm09095168_IMG_5495_2024-09-05_18.10.jpg"]
};
/* {autor, licenca, pagina} da foto de fotos/, ou null (foto dela, ou de fora) */
function fotoCredito(f) {
  const m = String(f || '').match(/^(?:\.\/)?fotos\/([a-z0-9-]+)\.jpg$/);
  const x = m && FOTO_FONTE[m[1]];
  return x ? { autor: x[0], licenca: x[1], pagina: x[2] } : null;
}
const fotoCreditoTexto = (f) => { const c = fotoCredito(f); return c ? `Foto: ${c.autor} · ${c.licenca} · Wikimedia Commons` : ''; };
/* o selo em cima da foto, com o link para a página da foto (autor e licença lá) */
function fotoCreditoHtml(f, cls) {
  const c = fotoCredito(f); if (!c) return '';
  return `<small class="${cls}"><a href="${esc(c.pagina)}" target="_blank" rel="noopener">${esc(fotoCreditoTexto(f))}</a></small>`;
}
