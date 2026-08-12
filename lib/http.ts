import { NextResponse } from 'next/server';

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function authStatus(message: string) {
  return message.includes('Telegram') || message.includes('initData') || message.includes('auth')
    ? 401
    : 400;
}
