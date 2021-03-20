import * as dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config();

const { DMM_ID, DMM_PW } = process.env;

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

await Promise.all(missionLinks.map(async(link) => {
  try {
    const p = await context.newPage();
    await p.goto(link);
    await p.waitForTimeout(15 * SECONDS);
    await p.close();
  } catch {}
}))

await page.reload();
try {
  await page.click('button.receiveAll_btn', {timeout: 15 * SECONDS});
  await page.waitForTimeout(15 * SECONDS);
} catch {}

await browser.close();

