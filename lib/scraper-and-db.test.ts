import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSocialUrl } from './url-parser.ts';
import { generateAntiBlockHeaders, calculateDelayJitter, getRandomUserAgent } from './anti-block.ts';
import { SQLikeDatabase } from './sqllike-db.ts';

test('URL Parser identifies Instagram Reels and canonicalizes correctly', () => {
  const parsed1 = parseSocialUrl('https://www.instagram.com/reel/C218aZ_N_4e/?igsh=MWQ=');
  assert.equal(parsed1.platform, 'instagram');
  assert.equal(parsed1.type, 'reel');
  assert.equal(parsed1.id, 'C218aZ_N_4e');
  assert.equal(parsed1.cleanUrl, 'https://www.instagram.com/reel/C218aZ_N_4e/');
  assert.equal(parsed1.isValid, true);

  const parsedPost = parseSocialUrl('https://instagram.com/p/DBxy1234567/');
  assert.equal(parsedPost.platform, 'instagram');
  assert.equal(parsedPost.type, 'post');
  assert.equal(parsedPost.id, 'DBxy1234567');
  assert.equal(parsedPost.isValid, true);
});

test('URL Parser identifies TikTok videos and shortlinks correctly', () => {
  const parsedTT = parseSocialUrl('https://www.tiktok.com/@creator/video/7342918829104829?lang=pt-BR');
  assert.equal(parsedTT.platform, 'tiktok');
  assert.equal(parsedTT.authorUsername, 'creator');
  assert.equal(parsedTT.id, '7342918829104829');
  assert.equal(parsedTT.cleanUrl, 'https://www.tiktok.com/@creator/video/7342918829104829');
  assert.equal(parsedTT.isValid, true);

  const parsedShort = parseSocialUrl('https://vm.tiktok.com/ZM8abcDEF/');
  assert.equal(parsedShort.platform, 'tiktok');
  assert.equal(parsedShort.type, 'short_link');
  assert.equal(parsedShort.id, 'ZM8abcDEF');
  assert.equal(parsedShort.isValid, true);
});

test('Anti-block module produces valid stealth headers and jitter', () => {
  const headers = generateAntiBlockHeaders('instagram');
  assert.ok(headers['User-Agent'], 'User agent must be present');
  assert.ok(headers['Accept-Language'], 'Language must be present');
  assert.equal(headers['Referer'], 'https://www.google.com/search?q=instagram+video');

  const jitter = calculateDelayJitter(100, 200);
  assert.ok(jitter >= 100 && jitter <= 300, 'Jitter within expected range');

  const ua = getRandomUserAgent('chrome_desktop');
  assert.ok(ua.includes('Chrome'), 'UA should contain Chrome');
});

test('SQLike database executes queries, filters, aggregates and updates correctly', () => {
  const testDb = new SQLikeDatabase();

  // Test SHOW TABLES
  const showRes = testDb.executeSQL('SHOW TABLES');
  assert.ok(showRes.rowCount >= 2, 'Should have at least 2 tables');
  assert.ok(showRes.rows.some((r) => r.table_name === 'videos'));

  // Test SELECT * FROM videos LIMIT 2
  const selectRes = testDb.executeSQL('SELECT id, platform, views FROM videos ORDER BY views DESC LIMIT 2');
  assert.equal(selectRes.rowCount, 2);
  assert.ok(selectRes.rows[0].views >= selectRes.rows[1].views);

  // Test WHERE clause
  const whereRes = testDb.executeSQL("SELECT id, platform FROM videos WHERE platform = 'tiktok'");
  assert.ok(whereRes.rowCount >= 1);
  for (const row of whereRes.rows) {
    assert.equal(row.platform, 'tiktok');
  }

  // Test Aggregates: COUNT, SUM, AVG
  const countRes = testDb.executeSQL('SELECT COUNT(*), SUM(views), AVG(views) FROM videos');
  assert.equal(countRes.rowCount, 1);
  assert.ok(countRes.rows[0]['COUNT(*)'] >= 2);
  assert.ok(countRes.rows[0]['SUM(views)'] > 0);

  // Test INSERT
  const insertRes = testDb.executeSQL(
    "INSERT INTO videos (id, platform, url, title, views, scraped_at) VALUES ('test_v99', 'tiktok', 'https://tiktok.com/@a/video/99', 'Test Video', 1234, '2026-10-18T12:00:00Z')"
  );
  assert.equal(insertRes.rowCount, 1);

  // Verify inserted row
  const verifyRes = testDb.executeSQL("SELECT id, views FROM videos WHERE id = 'test_v99'");
  assert.equal(verifyRes.rowCount, 1);
  assert.equal(verifyRes.rows[0].views, 1234);

  // Test UPDATE
  const updateRes = testDb.executeSQL("UPDATE videos SET views = 9999 WHERE id = 'test_v99'");
  assert.equal(updateRes.rowCount, 1);

  const verifyUpdate = testDb.executeSQL("SELECT views FROM videos WHERE id = 'test_v99'");
  assert.equal(verifyUpdate.rows[0].views, 9999);

  // Test DELETE
  const deleteRes = testDb.executeSQL("DELETE FROM videos WHERE id = 'test_v99'");
  assert.equal(deleteRes.rowCount, 1);

  const verifyDelete = testDb.executeSQL("SELECT id FROM videos WHERE id = 'test_v99'");
  assert.equal(verifyDelete.rowCount, 0);

  // Test recipes table in SQLike DB
  const recipesRes = testDb.executeSQL("SELECT id, recipe_title, prep_time FROM recipes");
  assert.ok(recipesRes.rowCount >= 1, 'Should have at least 1 pre-seeded recipe');
  assert.ok(recipesRes.rows[0].recipe_title.includes('Pudim'));

  // Test SQL Dump output
  const dump = testDb.generateSQLDump();
  assert.ok(dump.includes('CREATE TABLE "videos"'));
  assert.ok(dump.includes('CREATE TABLE "recipes"'));
  assert.ok(dump.includes('INSERT INTO "recipes"'));
});

