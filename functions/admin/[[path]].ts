import { AUTH_COOKIE_NAME } from '../../src/lib/auth';
import { getAdminAccessState } from '../../src/lib/admin-access';
import { getSessionMember } from '../../src/lib/members-db';

type AdminEnv = {
  paws?: D1Database;
  ADMIN_EMAIL_ALLOWLIST?: string;
};

const createLoginRedirect = (request: Request) => {
  const url = new URL('/auth/login', request.url);
  url.searchParams.set('next', `${new URL(request.url).pathname}${new URL(request.url).search}`);
  return Response.redirect(url.toString(), 302);
};

const readCookie = (request: Request, name: string) => {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex === -1) continue;

    const cookieName = cookie.slice(0, separatorIndex).trim();
    if (cookieName !== name) continue;

    return decodeURIComponent(cookie.slice(separatorIndex + 1));
  }

  return '';
};

const createForbiddenResponse = () =>
  new Response(
    `<!doctype html>
<html lang="zh-TW">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>無法存取後台 - PawsHome</title>
    <meta name="robots" content="noindex,nofollow" />
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #fff8f6;
        color: #2a1f1d;
      }
      .card {
        max-width: 32rem;
        padding: 2rem;
        margin: 1rem;
        border-radius: 1.25rem;
        background: white;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.08);
      }
      a {
        color: #c64f4f;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>無法存取後台</h1>
      <p>你目前已登入，但這個帳號沒有後台權限。</p>
      <p>如果你是管理者，請確認你的 Email 已加入 <code>ADMIN_EMAIL_ALLOWLIST</code>。</p>
      <p><a href="/member">回到會員頁</a></p>
    </main>
  </body>
</html>`,
    {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );

export const onRequest = async (context: {
  request: Request;
  env: AdminEnv;
  next: () => Promise<Response>;
}) => {
  const token = readCookie(context.request, AUTH_COOKIE_NAME);
  const member = await getSessionMember(context.env.paws, token);
  const access = getAdminAccessState(member, context.env.ADMIN_EMAIL_ALLOWLIST);

  if (access.allowed) {
    return context.next();
  }

  if (access.reason === 'not_logged_in') {
    return createLoginRedirect(context.request);
  }

  return createForbiddenResponse();
};
