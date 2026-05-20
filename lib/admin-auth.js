import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// In-memory rate limit: max 5 failed logins per IP per 15 min
const attempts = new Map();
const MAX_FAIL = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function isRateLimited(ip) {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) { attempts.delete(ip); return false; }
  return entry.count >= MAX_FAIL;
}

export function recordFailedLogin(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: now });
  } else {
    entry.count++;
  }
}

export function clearLoginAttempts(ip) {
  attempts.delete(ip);
}

export function remainingLockout(ip) {
  const entry = attempts.get(ip);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.first;
  return Math.ceil((WINDOW_MS - elapsed) / 60000); // minutes
}

// Shared auth check — returns null if OK, NextResponse if should abort
export async function requireAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// Validate positive integer ID from route param
export function parseId(str) {
  const n = parseInt(str, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}
