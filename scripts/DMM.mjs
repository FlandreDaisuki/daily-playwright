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
  expires: new Date('2099-12-31').getTime(),
}, {
  name: 'top_disclaimer',
  value:'1',
  domain: '.dmm.co.jp',
  path: '/',
  expires: new Date('2099-12-31').getTime(),
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
  'http://personal.games.dmm.co.jp/en/my-games/',
  'http://pc-play.games.dmm.co.jp/play/aigis/',
  'https://games.dmm.co.jp/detail/flower-x/',
  'https://games.dmm.co.jp/detail/otogi_f_r/',
  'https://pc-play.games.dmm.co.jp/play/kamipror/',
  ...await Promise.all(missionLinkEls.map((a) => a.getAttribute('href'))),
])];

const SECONDS = 1000;

await Promise.all(missionLinks.map(async(link, idx) => {
  try {
    log(`open link[${idx}]: ${link}`);
    const p = await context.newPage();
    await p.goto(link);
    await p.waitForTimeout(15 * SECONDS);
    await p.close();
    log(`close link[${idx}]`);
  } catch {}
}))

await page.reload();
try {
  await page.click('button.receiveAll_btn', { timeout: 15 * SECONDS });
  await page.waitForTimeout(15 * SECONDS);
  const missionStatusEls = await page.$$('.standardTab_section.is-receive .p-sectMission:first-child .missionFrame_status');
  log('1st mission:', await missionStatusEls[0].textContent());
  log('4th mission:', await missionStatusEls[3].textContent());
} catch {}

await browser.close();
log('</script>');
