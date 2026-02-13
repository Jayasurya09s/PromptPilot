const DAILY_CREDITS = Number(process.env.DAILY_CREDITS || 4);

export function getDailyCredits(): number {
  return DAILY_CREDITS;
}

export function getTodayUtcDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function needsCreditReset(lastReset?: Date | null): boolean {
  if (!lastReset) return true;
  const lastKey = lastReset.toISOString().slice(0, 10);
  const todayKey = getTodayUtcDate().toISOString().slice(0, 10);
  return lastKey !== todayKey;
}

export function applyDailyCredits(user: { creditsRemaining: number; lastCreditReset?: Date | null }): boolean {
  if (needsCreditReset(user.lastCreditReset)) {
    user.creditsRemaining = DAILY_CREDITS;
    user.lastCreditReset = getTodayUtcDate();
    return true;
  }
  return false;
}
