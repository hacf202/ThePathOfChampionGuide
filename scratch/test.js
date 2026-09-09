import { getCachedChampions } from '../be/src/services/dataService.js';

async function test() {
    const c = await getCachedChampions();
    const aatrox = c.find(x => x.championID === 'C076');
    console.log('Aatrox:', aatrox ? aatrox.name : 'Not found');
    const toSlug = (text) => text ? text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['"’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '';
    console.log('Slug:', toSlug(aatrox?.translations?.en?.name), 'or', toSlug(aatrox?.name));
}
test();
