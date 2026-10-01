import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, report, subject } = body || {};

    if (!to || !report) {
      return NextResponse.json({ success: false, message: 'Missing recipient or report content.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'Resend API key not configured.' }, { status: 400 });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'BLOOM <onboarding@resend.dev>',
        to: [to],
        subject: subject || 'Your girl’s Bloom update 🌸',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #6e3b53; max-width: 640px; margin: 0 auto; padding: 24px; background: #fff7fb; border-radius: 18px;">
            <h2 style="margin: 0 0 16px; color: #7c415f;">Your girl’s Bloom report 🌸</h2>
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.7; background: #fff; padding: 18px; border-radius: 12px; color: #6e3b53; border: 1px solid #f5d7e5; margin: 0;">${String(report).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            <p style="margin-top: 18px; font-size: 14px; color: #8b5d79;">You are doing amazing. Keep blooming. 🌷</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, message: data?.message || 'Email failed to send.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Unexpected error while sending report.' }, { status: 500 });
  }
}
