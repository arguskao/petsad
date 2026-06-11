import { site } from '../data/site';

type RegistrationEmailInput = {
  to: string;
  name: string;
  temporaryPassword: string;
  loginUrl: string;
  fromEmail?: string;
  fromName?: string;
  mailChannelsApiKey?: string;
  mailChannelsEndpoint?: string;
};

type MailChannelsPayload = {
  personalizations: Array<{
    to: Array<{
      email: string;
      name?: string;
    }>;
  }>;
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  content: Array<{
    type: 'text/plain' | 'text/html';
    value: string;
  }>;
};

const DEFAULT_MAILCHANNELS_ENDPOINT = 'https://api.mailchannels.net/tx/v1/send';

class RegistrationEmailError extends Error {
  kind: 'config' | 'delivery';

  constructor(kind: 'config' | 'delivery', message: string) {
    super(message);
    this.kind = kind;
    this.name = 'RegistrationEmailError';
  }
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getEmailDomain = (email: string) => email.split('@')[1]?.toLowerCase() || '';

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const createEmailBody = (input: RegistrationEmailInput) => {
  const subject = `${site.name} 會員密碼`;
  const plainText = [
    `${site.name} 會員註冊完成`,
    '',
    `你好，${input.name}`,
    '',
    `你的臨時密碼是：${input.temporaryPassword}`,
    `登入頁面：${input.loginUrl}`,
    '',
    '登入後請先更改密碼。',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, 'Noto Sans TC', sans-serif; line-height: 1.7; color: #2d3436;">
      <h2 style="margin: 0 0 12px;">${escapeHtml(site.name)} 會員註冊完成</h2>
      <p style="margin: 0 0 12px;">你好，${escapeHtml(input.name)}</p>
      <p style="margin: 0 0 12px;">你的臨時密碼是：</p>
      <div style="padding: 14px 16px; background: #fff5f0; border: 1px solid #ffd2c8; border-radius: 12px; font-size: 20px; font-weight: 800; letter-spacing: 0.08em;">
        ${escapeHtml(input.temporaryPassword)}
      </div>
      <p style="margin: 16px 0 12px;">登入頁面：<a href="${escapeHtml(input.loginUrl)}">${escapeHtml(input.loginUrl)}</a></p>
      <p style="margin: 0;">登入後請先更改密碼。</p>
    </div>
  `;

  return {
    subject,
    plainText,
    html,
  };
};

const resolveRegistrationEmailConfig = (input: RegistrationEmailInput) => {
  const mailChannelsApiKey = input.mailChannelsApiKey?.trim() || '';
  const fromEmail = input.fromEmail?.trim() || '';
  const fromName = input.fromName?.trim() || site.name;
  const mailChannelsEndpoint = input.mailChannelsEndpoint?.trim() || DEFAULT_MAILCHANNELS_ENDPOINT;

  if (!mailChannelsApiKey) {
    throw new RegistrationEmailError('config', '會員寄信功能尚未設定完成，請先設定 `MAILCHANNELS_API_KEY`。');
  }

  if (!fromEmail) {
    throw new RegistrationEmailError('config', '會員寄信功能尚未設定完成，請先設定 `MAIL_FROM_ADDRESS`。');
  }

  if (!isValidEmail(fromEmail)) {
    throw new RegistrationEmailError('config', '寄件地址格式不正確，請檢查 `MAIL_FROM_ADDRESS`。');
  }

  if (getEmailDomain(fromEmail).endsWith('.pages.dev')) {
    throw new RegistrationEmailError('config', '寄件地址不能使用 `pages.dev` 網域，請改用你自己的網域信箱。');
  }

  return {
    mailChannelsApiKey,
    fromEmail,
    fromName,
    mailChannelsEndpoint,
  };
};

const getMailChannelsErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 401 || response.status === 403) {
    return '寄信服務驗證失敗，請檢查 `MAILCHANNELS_API_KEY`、寄件網域 SPF 與 `_mailchannels` TXT 記錄。';
  }

  if (contentType.includes('application/json')) {
    const payload = (await response.json().catch(() => null)) as
      | {
          message?: unknown;
          error?: unknown;
          errors?: Array<{
            message?: unknown;
          }>;
        }
      | null;
    const message =
      (typeof payload?.message === 'string' && payload.message.trim()) ||
      (typeof payload?.error === 'string' && payload.error.trim()) ||
      (Array.isArray(payload?.errors) &&
      typeof payload.errors[0]?.message === 'string' &&
      payload.errors[0].message.trim()) ||
      '';

    if (message) {
      return `寄信失敗：${message}`;
    }
  }

  const rawMessage = await response.text().catch(() => '');
  if (rawMessage && !looksLikeHtml(rawMessage)) {
    return `寄信失敗：${rawMessage.slice(0, 180)}`;
  }

  if (response.status >= 500) {
    return '寄信服務暫時無法使用，請稍後再試。';
  }

  return '寄信失敗，請稍後再試。';
};

export const assertRegistrationEmailConfig = (input: RegistrationEmailInput) => {
  resolveRegistrationEmailConfig(input);
};

export const sendRegistrationEmail = async (input: RegistrationEmailInput) => {
  const { fromEmail, fromName, mailChannelsApiKey, mailChannelsEndpoint } = resolveRegistrationEmailConfig(input);
  const { subject, plainText, html } = createEmailBody(input);

  const payload: MailChannelsPayload = {
    personalizations: [
      {
        to: [
          {
            email: input.to,
            name: input.name,
          },
        ],
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    subject,
    content: [
      { type: 'text/plain', value: plainText },
      { type: 'text/html', value: html },
    ],
  };

  const response = await fetch(mailChannelsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': mailChannelsApiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new RegistrationEmailError('delivery', await getMailChannelsErrorMessage(response));
  }
};
