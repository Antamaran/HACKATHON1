const RESEND_API_URL = 'https://api.resend.com/emails';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildVerificationEmail({ to, code }) {
  return {
    subject: 'Your Event Connect verification code',
    html: `
      <h1>Event Connect</h1>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${escapeHtml(code)}</p>
      <p>This code was requested for ${escapeHtml(to)}.</p>
    `
  };
}

function buildInviteEmail({ to, eventName, inviteLink }) {
  return {
    subject: `Invitation: ${eventName}`,
    html: `
      <h1>${escapeHtml(eventName)}</h1>
      <p>You have been invited to an Event Connect event.</p>
      <p><a href="${escapeHtml(inviteLink)}">Open your invite</a></p>
      <p>${escapeHtml(inviteLink)}</p>
    `
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    return json(500, {
      error: 'Email is not configured. Set RESEND_API_KEY and EMAIL_FROM in Netlify environment variables.'
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  const { type, to } = payload;
  if (!to || typeof to !== 'string') {
    return json(400, { error: 'Missing recipient email' });
  }

  let message;
  if (type === 'verification') {
    if (!payload.code) {
      return json(400, { error: 'Missing verification code' });
    }
    message = buildVerificationEmail(payload);
  } else if (type === 'invite') {
    if (!payload.eventName || !payload.inviteLink) {
      return json(400, { error: 'Missing invite details' });
    }
    message = buildInviteEmail(payload);
  } else {
    return json(400, { error: 'Unsupported email type' });
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject: message.subject,
      html: message.html
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return json(response.status, {
      error: data.message || 'Email provider rejected the request'
    });
  }

  return json(200, { ok: true, id: data.id });
};
