import * as dotenv from 'dotenv';
import { chromium } from 'playwright';

dotenv.config();

const browser = await chromium.launch();
const context = await browser.newContext();

const page = await context.newPage();

const { DLSITE_ID, DLSITE_PW } = process.env

await page.goto('https://login.dlsite.com/login');
await page.fill('#form_id', DLSITE_ID)
await page.fill('#form_password', DLSITE_PW);
await page.click('button[type="submit"]');

await context.addCookies([{
  name: 'adultchecked',
  value:'1',
  domain: '.dlsite.com',
  path: '/',
  expires: new Date('2099-12-31').getTime()
}])

const pathFilterQuery = [
  'language','jp',
  'sex_category[0]/male/ana_flg/off',
  'age_category[0]/adult',
  'work_category[0]/doujin',
  'work_category[1]/pc',
  'order[0]/release_d',
  'work_type[0]/ICG',
  'work_type[1]/SOU',
  'work_type[2]/MUS',
  'work_type[3]/ET3',
  'work_type_name[0]/CG・イラスト',
  'work_type_name[1]/ボイス・ASMR',
  'work_type_name[2]/音楽',
  'work_type_name[3]/その他',
  'work_type_category[0]/game',
  'work_type_category[1]/comic',
  'work_type_category_name[0]/ゲーム',
  'work_type_category_name[1]/マンガ',
  'genre_and_or/or/options_and_or/or',
  'options[0]/JPN/options[1]/CHI_HANT',
  'options_name[0]/日本語作品/options_name[1]/繁体字作品'
].join('/');

const pathNavQuery = [
  'per_page/100',
  'is_free/1',
  'show_type/3'
].join('/');

await page.goto(`https://www.dlsite.com/maniax/fsr/=/${pathFilterQuery}/${pathNavQuery}`);
try {
  await page.waitForSelector('.modal_close', {timeout: 10 * 1000});
  (await page.$('.modal_close'))?.click({ force: true });
} catch {}

const cartButtons = await page.$$('a.btn_cart');
for (const btn of cartButtons) {
  await btn.click({ force: true });
}

await page.goto('https://www.dlsite.com/maniax/cart');
await page.click('#submit_x', { force: true });

await page.waitForLoadState();
await page.click('#submit_x', { force: true });

await browser.close();
