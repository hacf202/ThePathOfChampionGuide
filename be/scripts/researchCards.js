import fs from 'fs';
import path from 'path';

const cardListPath = 'd:/ThePathOfChampionGuide/be/datacard/cardList.json';

try {
  const cards = JSON.parse(fs.readFileSync(cardListPath, 'utf8'));
  console.log(`Loaded ${cards.length} cards.`);
  
  const viMap = new Map();
  const enMap = new Map();
  
  cards.forEach(c => {
    if (c.cardName) {
      if (!viMap.has(c.cardName)) viMap.set(c.cardName, []);
      viMap.get(c.cardName).push(c.cardCode);
    }
    if (c.translations && c.translations.en && c.translations.en.cardName) {
      const enName = c.translations.en.cardName;
      if (!enMap.has(enName)) enMap.set(enName, []);
      enMap.get(enName).push(c.cardCode);
    }
  });

  // Check for duplicates
  const viDupes = Array.from(viMap.entries()).filter(e => e[1].length > 1);
  const enDupes = Array.from(enMap.entries()).filter(e => e[1].length > 1);
  
  console.log(`VI Names with multiple codes: ${viDupes.length}`);
  console.log(`EN Names with multiple codes: ${enDupes.length}`);
  
  if (viDupes.length > 0) {
    console.log('Sample VI Dupes:', viDupes.slice(0, 5));
  }
  
  // Specific case check for "Rìu Xoay"
  console.log('Searching for "Rìu Xoay"...');
  const dXoay = cards.filter(c => c.cardName && c.cardName.includes('Rìu Xoay'));
  console.log('Found:', JSON.stringify(dXoay, null, 2));

} catch (error) {
  console.error('Error:', error);
}
