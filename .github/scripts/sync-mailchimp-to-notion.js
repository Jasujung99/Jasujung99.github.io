// Mailchimp → Notion 동기화 스크립트
// - 실행 환경: GitHub Actions (Node 20)
// - 필요한 환경변수(secrets):
//   MAILCHIMP_API_KEY, MAILCHIMP_DC, MAILCHIMP_LIST_ID,
//   NOTION_TOKEN, NOTION_DATABASE_ID
// - 동작:
//   1) Mailchimp Audience의 모든 멤버를 페이지네이션으로 조회
//   2) 각 멤버 이메일을 기준으로 Notion DB에 업서트(Email equals)
//   3) Source(select)와 LastSeen(date) 갱신

import fetch from 'node-fetch';
import { Client } from '@notionhq/client';

const MC_KEY = process.env.MAILCHIMP_API_KEY;
const MC_DC = process.env.MAILCHIMP_DC; // ex) us16
const MC_LIST = process.env.MAILCHIMP_LIST_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB = process.env.NOTION_DATABASE_ID;

if (!MC_KEY || !MC_DC || !MC_LIST || !NOTION_TOKEN || !NOTION_DB) {
  console.error('[ERROR] Missing required env variables');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function fetchAllMembers() {
  const result = [];
  let offset = 0;
  const count = 1000; // Mailchimp API: 최대값 확인(1000 권장)
  while (true) {
    const url = `https://${MC_DC}.api.mailchimp.com/3.0/lists/${MC_LIST}/members?offset=${offset}&count=${count}`;
    const resp = await fetch(url, {
      headers: { Authorization: `apikey ${MC_KEY}` },
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Mailchimp fetch failed: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    const members = data.members || [];
    result.push(...members);
    const total = data.total_items || 0;
    if (offset + members.length >= total) break;
    offset += count;
  }
  return result;
}

async function upsertNotion(email, source, lastChangedIso) {
  // DB 속성명: 필요시 프로젝트에 맞게 조정
  const EMAIL_PROP = 'Email';
  const SOURCE_PROP = 'Source';
  const LASTSEEN_PROP = 'LastSeen';

  const find = await notion.databases.query({
    database_id: NOTION_DB,
    filter: { property: EMAIL_PROP, email: { equals: email } },
    page_size: 1,
  });

  const last = new Date(lastChangedIso || Date.now()).toISOString();

  if (find.results.length === 0) {
    await notion.pages.create({
      parent: { database_id: NOTION_DB },
      properties: {
        [EMAIL_PROP]: { email },
        [SOURCE_PROP]: { select: { name: source || 'mailchimp' } },
        [LASTSEEN_PROP]: { date: { start: last } },
      },
    });
    return 'created';
  } else {
    const pageId = find.results[0].id;
    await notion.pages.update({
      page_id: pageId,
      properties: {
        [LASTSEEN_PROP]: { date: { start: last } },
      },
    });
    return 'updated';
  }
}

(async () => {
  console.log('[INFO] Start Mailchimp → Notion sync');
  const members = await fetchAllMembers();
  console.log(`[INFO] Mailchimp members fetched: ${members.length}`);

  let created = 0;
  let updated = 0;
  for (const m of members) {
    const email = String(m.email_address || '').trim().toLowerCase();
    if (!email) continue;
    const tags = Array.isArray(m.tags) ? m.tags : [];
    const source = (tags[0]?.name) || 'mailchimp';
    const lastChanged = m.last_changed || m.timestamp_opt || m.timestamp_signup;

    try {
      const res = await upsertNotion(email, source, lastChanged);
      if (res === 'created') created++; else updated++;
    } catch (e) {
      // PII 최소화: 이메일만 간략히 기록
      console.error(`[ERROR] upsert failed for ${email}:`, (e && e.message) || e);
    }
  }

  console.log(`[DONE] Notion upsert complete. created=${created}, updated=${updated}`);
})().catch(err => {
  console.error('[FATAL]', (err && err.message) || err);
  process.exit(1);
});
