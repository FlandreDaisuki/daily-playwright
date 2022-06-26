import * as dotenv from 'dotenv';
import { chromium } from 'playwright';
import { log } from './utils.mjs';

dotenv.config();

const { DMM_ID, DMM_PW } = process.env;

log('<script>');

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

await context.addCookies([{
  name: 'age_check_done',
  value:'1',
  domain: '.dmm.co.jp',
  path: '/',
  expires: -1,
}, {
  name: 'top_disclaimer',
  value:'1',
  domain: '.dmm.co.jp',
  path: '/',
  expires: -1,
}]);

await page.goto('https://accounts.dmm.co.jp/service/login/password');
await page.fill('#login_id', DMM_ID);
await page.fill('#password', DMM_PW);
await page.click('input[type="submit"]');
try {
  await page.waitForNavigation();
  log('Logged in!');
} catch {}

await page.goto('https://mission.games.dmm.co.jp/')

const missionLinkEls = await page.$$('a.listMission_targetLink');
const missionLinks = [...new Set([
  'https://library.games.dmm.co.jp',
  'https://pc-play.games.dmm.co.jp/play/aigis/',
  'https://pc-play.games.dmm.co.jp/play/imys_r/',
  'https://pc-play.games.dmm.co.jp/play/senpri/',
  'https://pc-play.games.dmm.co.jp/play/flower-x/',
  'https://pc-play.games.dmm.co.jp/play/kamipror/',
  'https://pc-play.games.dmm.co.jp/play/otogi_f_r/',
  'https://pc-play.games.dmm.co.jp/play/monmusutdx/',
  'https://pc-play.games.dmm.co.jp/play/edensgrenzex/',
  'https://pc-play.games.dmm.co.jp/play/necro_suicide_mission_r/',
  ...await Promise.all(missionLinkEls.map((a) => a.getAttribute('href'))),
])];

const SECONDS = 1000;

for await (const link of missionLinks) {
  const idx = missionLinks.indexOf(link)
  const p = await context.newPage();
  const returns = { link };
  try {
    log(`open link[${idx}]: ${link}`);
    const listener = async(req) => {
      if(req.url() === 'https://api-mission.games.dmm.com/games_play/v1') {
        p.off('request', listener);

        returns.request = {
          headers: req.headers(),
          body: JSON.stringify(req.postDataJSON()),
        };
        const resp = await req.response();
        returns.response = {
          status: resp.status(),
          body: (await resp.body()).toString(),
        };
      }
    };
    p.on('request', listener)

    await p.goto(link);
  } catch {
    log(`link[${idx}]: Timeout`);
  } finally {
    await p.close();
    log(`link[${idx}]`, returns);
  }
}

await page.reload();
try {
  await page.click('button.receiveAll_btn', { timeout: 15 * SECONDS });
  await page.waitForTimeout(15 * SECONDS);
  const dailyMissionStatusEls = await page.$$('.standardTab_section.is-receive .p-sectMission:first-child .missionFrame_status');
  log('1st daily:', await dailyMissionStatusEls[0].textContent());
  log('4th daily:', await dailyMissionStatusEls[3].textContent());

  await page.click('[data-actionlabel="mission_right_tab"]');
  const lotteryMissionStatusEls =  await page.$$('.listMission_targetText');
  const toLotteryLog = (t) => {
    const msg = t.split('\n').map(s=>s.trim()).filter(Boolean);
    const name = msg.pop();
    return { name, msg };
  }
  const monthlyMissionStatusEls = lotteryMissionStatusEls.slice(0, 2);
  const weeklyMissionStatusEls = lotteryMissionStatusEls.slice(2);
  for (const el of weeklyMissionStatusEls) {
    const t = await el.textContent();
    const { name, msg } = toLotteryLog(t);
    log(`weekly [${name}]:`, ...msg);
  }
  for (const el of monthlyMissionStatusEls) {
    const t = await el.textContent();
    const { name, msg } = toLotteryLog(t);
    log(`monthly [${name}]:`, ...msg);
  }
} catch {}

await browser.close();
log('</script>');
