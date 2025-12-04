import { getLocationCode } from './scripts/lib/seo_client_v2.js';

const testCases = [
    "Malaga",
    "Málaga",
    "Malaga,Andalusia,Spain",
    "Zaragoza",
    "Zaragoza,Aragon,Spain",
    "Madrid"
];

console.log("Testing getLocationCode:");
testCases.forEach(loc => {
    const code = getLocationCode(loc);
    console.log(`"${loc}" -> ${code} (${code === 2724 ? 'DEFAULT/SPAIN' : 'CITY'})`);
});
