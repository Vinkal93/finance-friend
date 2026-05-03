/**
 * AdMob Manager — handles all ad logic with strict UX rules.
 * Uses @capacitor-community/admob on native platform; no-op gracefully on web.
 *
 * 🔧 REAL AdMob Ad Unit IDs go here. Defaults are Google's official test IDs
 *    so the app is safe to build & run before you paste your live IDs.
 *    Override at runtime via setRealAdIds({ ... }) — values persist in localStorage.
 */
const TEST_IDS = {
  appOpen: 'ca-app-pub-3940256099942544/9257395921',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  banner: 'ca-app-pub-3940256099942544/6300978111',
};

// 👉 PASTE YOUR REAL ADMOB IDs HERE (or call setRealAdIds at runtime).
// Leaving any field empty falls back to the Google test ID for that slot.
const LIVE_IDS: Partial<typeof TEST_IDS> = {
  appOpen: '',
  interstitial: '',
  rewarded: '',
  banner: '',
};

function loadOverrides(): Partial<typeof TEST_IDS> {
  try { return JSON.parse(localStorage.getItem('ads-unit-overrides') || '{}'); }
  catch { return {}; }
}

function resolveUnits(): typeof TEST_IDS {
  const ov = loadOverrides();
  const pick = (k: keyof typeof TEST_IDS) =>
    (ov[k] && ov[k]!.trim()) || (LIVE_IDS[k] && LIVE_IDS[k]!.trim()) || TEST_IDS[k];
  return {
    appOpen: pick('appOpen'),
    interstitial: pick('interstitial'),
    rewarded: pick('rewarded'),
    banner: pick('banner'),
  };
}

export const AD_UNITS = resolveUnits();

export function setRealAdIds(ids: Partial<typeof TEST_IDS>) {
  const cur = loadOverrides();
  localStorage.setItem('ads-unit-overrides', JSON.stringify({ ...cur, ...ids }));
  Object.assign(AD_UNITS, resolveUnits());
}

export function getActiveAdIds() { return { ...AD_UNITS }; }
export function isUsingTestIds() {
  return AD_UNITS.interstitial === TEST_IDS.interstitial;
}

import { Capacitor } from '@capacitor/core';

const STORAGE = {
  appOpenCount: 'ads-app-open-count',
  lastAdTs: 'ads-last-ts',
  installTs: 'ads-install-ts',
  goalCount: 'ads-goal-count',
  forgotPwAttempts: 'ads-forgot-pw',
  aiUsage: 'ads-ai-usage',
  aiUnlockTs: 'ads-ai-unlock-ts',
  enabled: 'ads-enabled',
  metrics: 'ads-metrics',
};

const COOLDOWN_MS = 5 * 60 * 1000; // 5 min
const NEW_USER_GRACE_MS = 24 * 60 * 60 * 1000; // 24 h

/* ---------------- helpers ---------------- */

function num(key: string, fallback = 0): number {
  return Number(localStorage.getItem(key) || fallback);
}
function setNum(key: string, v: number) {
  localStorage.setItem(key, String(v));
}

function isEnabled(): boolean {
  return localStorage.getItem(STORAGE.enabled) !== 'false';
}

function isNewUser(): boolean {
  let installTs = num(STORAGE.installTs);
  if (!installTs) {
    installTs = Date.now();
    setNum(STORAGE.installTs, installTs);
  }
  return Date.now() - installTs < NEW_USER_GRACE_MS;
}

function inCooldown(): boolean {
  return Date.now() - num(STORAGE.lastAdTs) < COOLDOWN_MS;
}

function markAdShown() {
  setNum(STORAGE.lastAdTs, Date.now());
  trackMetric('ad_impressions');
}

function trackMetric(name: string) {
  try {
    const m = JSON.parse(localStorage.getItem(STORAGE.metrics) || '{}');
    m[name] = (m[name] || 0) + 1;
    localStorage.setItem(STORAGE.metrics, JSON.stringify(m));
  } catch { /* noop */ }
}

export function getAdMetrics() {
  try { return JSON.parse(localStorage.getItem(STORAGE.metrics) || '{}'); }
  catch { return {}; }
}

function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/* ---------------- AdMob bridge ---------------- */

let adMobInited = false;
let interstitialReady = false;
let rewardedReady = false;

async function initAdMob() {
  if (adMobInited || !isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.initialize({ initializeForTesting: false });
    adMobInited = true;
  } catch (e) {
    console.warn('AdMob init failed', e);
  }
}

async function preloadInterstitial() {
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareInterstitial({ adId: AD_UNITS.interstitial });
    interstitialReady = true;
  } catch (e) { interstitialReady = false; }
}

async function preloadRewarded() {
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareRewardVideoAd({ adId: AD_UNITS.rewarded });
    rewardedReady = true;
  } catch (e) { rewardedReady = false; }
}

/* ---------------- public API ---------------- */

export async function initializeAds() {
  await initAdMob();
  if (isNative() && isEnabled() && !isNewUser()) {
    preloadInterstitial();
    preloadRewarded();
  }
}

/** Returns true if shown */
export async function maybeShowInterstitial(reason: string): Promise<boolean> {
  if (!isEnabled() || isNewUser() || inCooldown()) return false;
  if (!isNative()) {
    console.log(`[ads] would show interstitial (${reason})`);
    markAdShown();
    return true;
  }
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    if (!interstitialReady) await preloadInterstitial();
    if (!interstitialReady) return false;
    await AdMob.showInterstitial();
    markAdShown();
    interstitialReady = false;
    preloadInterstitial();
    return true;
  } catch (e) {
    console.warn('interstitial failed', e);
    return false;
  }
}

/** Returns true if user earned reward */
export async function showRewardedAd(): Promise<boolean> {
  if (!isEnabled()) return false;
  if (!isNative()) {
    console.log('[ads] would show rewarded');
    await new Promise(r => setTimeout(r, 600));
    markAdShown();
    return true;
  }
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    if (!rewardedReady) await preloadRewarded();
    if (!rewardedReady) return false;
    const result = await AdMob.showRewardVideoAd();
    rewardedReady = false;
    preloadRewarded();
    markAdShown();
    return !!result;
  } catch (e) {
    console.warn('rewarded failed', e);
    return false;
  }
}

export async function showBanner() {
  if (!isEnabled() || isNewUser() || !isNative()) return;
  try {
    const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
    await AdMob.showBanner({
      adId: AD_UNITS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });
  } catch (e) { console.warn('banner failed', e); }
}

export async function hideBanner() {
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.hideBanner();
  } catch { /* noop */ }
}

/* ---------------- domain triggers ---------------- */

/** App open: 1st & 2nd → no ad. 3rd → interstitial, reset counter. */
export async function onAppOpen() {
  if (isNewUser()) return;
  const c = num(STORAGE.appOpenCount) + 1;
  setNum(STORAGE.appOpenCount, c);
  if (c >= 3) {
    setNum(STORAGE.appOpenCount, 0);
    await maybeShowInterstitial('app-open-3rd');
  }
}

/** Goal creation: 1st free. Every 2nd → interstitial. */
export async function onGoalCreated() {
  const c = num(STORAGE.goalCount) + 1;
  setNum(STORAGE.goalCount, c);
  if (c % 2 === 0) {
    await maybeShowInterstitial('goal-created-2nd');
  }
}

/** AI: 3 free queries / day, then watch ad to unlock 5 more (1hr cooldown). */
export interface AIUsageInfo {
  used: number;
  freeLimit: number;
  bonus: number;
  canQuery: boolean;
  canUnlock: boolean;
  cooldownRemainingMs: number;
}

export function getAIUsage(): AIUsageInfo {
  const today = new Date().toISOString().slice(0, 10);
  let data: { date: string; used: number; bonus: number };
  try {
    data = JSON.parse(localStorage.getItem(STORAGE.aiUsage) || '{}');
  } catch { data = { date: today, used: 0, bonus: 0 }; }
  if (data.date !== today) data = { date: today, used: 0, bonus: 0 };
  const lastUnlock = num(STORAGE.aiUnlockTs);
  const cdMs = 60 * 60 * 1000;
  const cdRemaining = Math.max(0, lastUnlock + cdMs - Date.now());
  const allowed = data.used < (3 + data.bonus);
  return {
    used: data.used,
    freeLimit: 3,
    bonus: data.bonus,
    canQuery: allowed,
    canUnlock: cdRemaining === 0,
    cooldownRemainingMs: cdRemaining,
  };
}

export function consumeAIQuery() {
  const today = new Date().toISOString().slice(0, 10);
  let data: { date: string; used: number; bonus: number };
  try { data = JSON.parse(localStorage.getItem(STORAGE.aiUsage) || '{}'); }
  catch { data = { date: today, used: 0, bonus: 0 }; }
  if (data.date !== today) data = { date: today, used: 0, bonus: 0 };
  data.used += 1;
  localStorage.setItem(STORAGE.aiUsage, JSON.stringify(data));
}

export async function unlockAIWithAd(): Promise<boolean> {
  const ok = await showRewardedAd();
  if (!ok) return false;
  const today = new Date().toISOString().slice(0, 10);
  let data: { date: string; used: number; bonus: number };
  try { data = JSON.parse(localStorage.getItem(STORAGE.aiUsage) || '{}'); }
  catch { data = { date: today, used: 0, bonus: 0 }; }
  if (data.date !== today) data = { date: today, used: 0, bonus: 0 };
  data.bonus = (data.bonus || 0) + 3;
  localStorage.setItem(STORAGE.aiUsage, JSON.stringify(data));
  setNum(STORAGE.aiUnlockTs, Date.now());
  return true;
}

/** Forgot password: 1st attempt no ad, after that optional rewarded. */
export function getForgotPwAttempts(): number {
  return num(STORAGE.forgotPwAttempts);
}
export function incForgotPwAttempts() {
  setNum(STORAGE.forgotPwAttempts, getForgotPwAttempts() + 1);
}
export function resetForgotPwAttempts() {
  setNum(STORAGE.forgotPwAttempts, 0);
}

/* Settings - user toggle */
export function setAdsEnabled(v: boolean) {
  localStorage.setItem(STORAGE.enabled, v ? 'true' : 'false');
}
export function getAdsEnabled(): boolean {
  return isEnabled();
}
export function getNewUserStatus() {
  const installTs = num(STORAGE.installTs) || Date.now();
  const remaining = Math.max(0, installTs + NEW_USER_GRACE_MS - Date.now());
  return { isNewUser: remaining > 0, remainingMs: remaining };
}
