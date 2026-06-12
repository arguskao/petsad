export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type GoogleUserProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
  email_verified?: boolean;
};

type GoogleTokenResponse = {
  error_description?: string;
  access_token?: string;
};

type GoogleUserInfoResponse = {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
  email_verified?: boolean;
};

export const GOOGLE_OAUTH_STATE_COOKIE = 'paws-google-oauth-state';
export const GOOGLE_OAUTH_NEXT_COOKIE = 'paws-google-oauth-next';

export const sanitizeInternalPath = (value: string | null | undefined, fallback = '/member') => {
  const next = value?.trim() || '';
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback;
  return next;
};

export const createGoogleOAuthState = () => crypto.randomUUID().replaceAll('-', '');

export const buildGoogleAuthorizationUrl = (config: GoogleOAuthConfig, state: string) => {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
};

export const exchangeGoogleAuthorizationCode = async (input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      code: input.code,
      grant_type: 'authorization_code',
      redirect_uri: input.redirectUri,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GoogleTokenResponse;
  if (!response.ok) {
    const description = typeof data?.error_description === 'string' ? data.error_description : '';
    throw new Error(description || 'Google 驗證失敗，請稍後再試。');
  }

  const accessToken = typeof data?.access_token === 'string' ? data.access_token : '';
  if (!accessToken) {
    throw new Error('Google 驗證失敗，沒有取得 access token。');
  }

  return {
    accessToken,
  };
};

export const fetchGoogleUserProfile = async (accessToken: string) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json().catch(() => ({}))) as GoogleUserInfoResponse;
  if (!response.ok) {
    throw new Error('Google 帳號資訊讀取失敗。');
  }

  const sub = typeof data?.id === 'string' ? data.id : typeof data?.sub === 'string' ? data.sub : '';
  const email = typeof data?.email === 'string' ? data.email : '';
  const name = typeof data?.name === 'string' ? data.name : email;
  const picture = typeof data?.picture === 'string' ? data.picture : '';
  const verifiedEmail = Boolean(data?.verified_email ?? data?.email_verified);

  if (!sub || !email) {
    throw new Error('Google 帳號資訊不完整。');
  }

  return {
    sub,
    email,
    name,
    picture,
    verifiedEmail,
  } satisfies GoogleUserProfile & { verifiedEmail: boolean };
};
