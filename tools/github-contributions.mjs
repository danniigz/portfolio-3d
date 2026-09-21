// Genera public/data/github.json con el calendario de contribuciones (GraphQL de GitHub)
// Uso: GITHUB_TOKEN=... node tools/github-contributions.mjs [usuario]
import fs from 'node:fs';

const user = process.argv[2] || 'danniigz';
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('Falta GITHUB_TOKEN');

const query = `query($u:String!){user(login:$u){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'portfolio-3d' },
  body: JSON.stringify({ query, variables: { u: user } }),
});
const json = await res.json();
const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
if (!cal) throw new Error(`Respuesta inesperada: ${JSON.stringify(json.errors ?? json)}`);

const out = {
  user,
  generatedAt: new Date().toISOString(),
  total: cal.totalContributions,
  weeks: cal.weeks.map((w) => ({
    days: w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
  })),
};
fs.writeFileSync('public/data/github.json', JSON.stringify(out) + '\n');
console.log(`OK: ${out.total} contribuciones`);
