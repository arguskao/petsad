var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-ASWDPW/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-ASWDPW/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// .wrangler/tmp/pages-w6xS6D/functionsWorker-0.22901393987538365.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
function stripCfConnectingIPHeader2(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
__name2(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader2.apply(null, argArray)
    ]);
  }
});
var compose = /* @__PURE__ */ __name2((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
    __name2(dispatch, "dispatch");
  };
}, "compose");
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
var parseBody = /* @__PURE__ */ __name2(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
__name2(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
__name2(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name2((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name2((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var splitPath = /* @__PURE__ */ __name2((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name2((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name2((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match3, index) => {
    const mark = `@${index}`;
    groups.push([mark, match3]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name2((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name2((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match3 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match3) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match3[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match3[1], new RegExp(`^${match3[2]}(?=/${next})`)] : [label, match3[1], new RegExp(`^${match3[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match3[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name2((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match3) => {
      try {
        return decoder(match3);
      } catch {
        return match3;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name2((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name2((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name2((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name2((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name2((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name2((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name2((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name2((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;
var tryDecodeURIComponent = /* @__PURE__ */ __name2((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name2(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name2((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name2(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name2((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name2(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name2((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name2(class extends Error {
}, "UnsupportedPathError");
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";
var notFoundHandler = /* @__PURE__ */ __name2((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name2((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name2(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name2((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name2(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono"), "_Hono");
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match22 = /* @__PURE__ */ __name2((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match22;
  return match22(method, path);
}
__name(match, "match");
__name2(match, "match");
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
__name2(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node"), "_Node");
var Trie = /* @__PURE__ */ __name2(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
__name2(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
__name2(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes2) {
  const trie = new Trie();
  const handlerData = [];
  if (routes2.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes2.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
__name2(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
__name2(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name2(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes2 = this.#routes;
    if (!middleware || !routes2) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes2].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes2).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes2[m]).forEach(
            (p) => re.test(p) && routes2[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes2).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes2[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes2[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes2 = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes2.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes2.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes2);
    }
  }
}, "RegExpRouter");
var SmartRouter = /* @__PURE__ */ __name2(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes2 = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes2.length; i2 < len2; i2++) {
          router.add(...routes2[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name2(/* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node2"), "_Node");
var TrieRouter = /* @__PURE__ */ __name2(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");
var Hono2 = /* @__PURE__ */ __name2(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");
var validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
var validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
var parse = /* @__PURE__ */ __name2((cookie, name) => {
  if (name && cookie.indexOf(name) === -1) {
    return {};
  }
  const pairs = cookie.trim().split(";");
  const parsedCookie = {};
  for (let pairStr of pairs) {
    pairStr = pairStr.trim();
    const valueStartPos = pairStr.indexOf("=");
    if (valueStartPos === -1) {
      continue;
    }
    const cookieName = pairStr.substring(0, valueStartPos).trim();
    if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
      continue;
    }
    let cookieValue = pairStr.substring(valueStartPos + 1).trim();
    if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
      cookieValue = cookieValue.slice(1, -1);
    }
    if (validCookieValueRegEx.test(cookieValue)) {
      parsedCookie[cookieName] = cookieValue.indexOf("%") !== -1 ? tryDecode(cookieValue, decodeURIComponent_) : cookieValue;
      if (name) {
        break;
      }
    }
  }
  return parsedCookie;
}, "parse");
var _serialize = /* @__PURE__ */ __name2((name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${opt.maxAge | 0}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.priority) {
    cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
}, "_serialize");
var serialize = /* @__PURE__ */ __name2((name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
}, "serialize");
var getCookie = /* @__PURE__ */ __name2((c, key, prefix) => {
  const cookie = c.req.raw.headers.get("Cookie");
  if (typeof key === "string") {
    if (!cookie) {
      return void 0;
    }
    let finalKey = key;
    if (prefix === "secure") {
      finalKey = "__Secure-" + key;
    } else if (prefix === "host") {
      finalKey = "__Host-" + key;
    }
    const obj2 = parse(cookie, finalKey);
    return obj2[finalKey];
  }
  if (!cookie) {
    return {};
  }
  const obj = parse(cookie);
  return obj;
}, "getCookie");
var generateCookie = /* @__PURE__ */ __name2((name, value, opt) => {
  let cookie;
  if (opt?.prefix === "secure") {
    cookie = serialize("__Secure-" + name, value, { path: "/", ...opt, secure: true });
  } else if (opt?.prefix === "host") {
    cookie = serialize("__Host-" + name, value, {
      ...opt,
      path: "/",
      secure: true,
      domain: void 0
    });
  } else {
    cookie = serialize(name, value, { path: "/", ...opt });
  }
  return cookie;
}, "generateCookie");
var setCookie = /* @__PURE__ */ __name2((c, name, value, opt) => {
  const cookie = generateCookie(name, value, opt);
  c.header("Set-Cookie", cookie, { append: true });
}, "setCookie");
var deleteCookie = /* @__PURE__ */ __name2((c, name, opt) => {
  const deletedCookie = getCookie(c, name, opt?.prefix);
  setCookie(c, name, "", { ...opt, maxAge: 0 });
  return deletedCookie;
}, "deleteCookie");
var handle = /* @__PURE__ */ __name2((app2) => (eventContext) => {
  return app2.fetch(
    eventContext.request,
    { ...eventContext.env, eventContext },
    {
      waitUntil: eventContext.waitUntil,
      passThroughOnException: eventContext.passThroughOnException,
      props: {}
    }
  );
}, "handle");
var AUTH_COOKIE_NAME = "paws-session";
var SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
var encoder = new TextEncoder();
var toBase64Url = /* @__PURE__ */ __name2((buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}, "toBase64Url");
var digest = /* @__PURE__ */ __name2(async (value) => {
  const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toBase64Url(buffer);
}, "digest");
var normalizeEmail = /* @__PURE__ */ __name2((value) => value.trim().toLowerCase(), "normalizeEmail");
var normalizeName = /* @__PURE__ */ __name2((value) => value.trim().replace(/\s+/g, " "), "normalizeName");
var createSalt = /* @__PURE__ */ __name2(() => crypto.randomUUID().replaceAll("-", ""), "createSalt");
var hashPassword = /* @__PURE__ */ __name2(async (password, salt) => digest(`${salt}:${password}`), "hashPassword");
var verifyPassword = /* @__PURE__ */ __name2(async (password, salt, passwordHash) => {
  const candidate = await hashPassword(password, salt);
  return candidate === passwordHash;
}, "verifyPassword");
var createSessionToken = /* @__PURE__ */ __name2(() => crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", ""), "createSessionToken");
var hashSessionToken = /* @__PURE__ */ __name2(async (token) => digest(token), "hashSessionToken");
var sessionExpiresAt = /* @__PURE__ */ __name2((ttlSeconds = SESSION_TTL_SECONDS) => new Date(Date.now() + ttlSeconds * 1e3).toISOString(), "sessionExpiresAt");
var createTemporaryPassword = /* @__PURE__ */ __name2(() => crypto.randomUUID().replaceAll("-", "").slice(0, 12), "createTemporaryPassword");
var toPublicMember = /* @__PURE__ */ __name2((member) => ({
  id: member.id,
  email: member.email,
  name: member.name,
  createdAt: member.created_at,
  updatedAt: member.updated_at,
  mustChangePassword: Boolean(member.must_change_password)
}), "toPublicMember");
var site = {
  name: "PawsHome",
  title: "PawsHome - \u7D66\u7260\u5011\u4E00\u500B\u6EAB\u6696\u7684\u5BB6",
  description: "\u5C0B\u627E\u4F60\u7684\u6BDB\u5B69\u5925\u4F34\uFF0C\u7D66\u6D41\u6D6A\u52D5\u7269\u4E00\u500B\u5145\u6EFF\u611B\u7684\u5BB6\u3002"
};
var DEFAULT_MAILCHANNELS_ENDPOINT = "https://api.mailchannels.net/tx/v1/send";
var RegistrationEmailError = /* @__PURE__ */ __name(class extends Error {
  kind;
  constructor(kind, message) {
    super(message);
    this.kind = kind;
    this.name = "RegistrationEmailError";
  }
}, "RegistrationEmailError");
__name2(RegistrationEmailError, "RegistrationEmailError");
var isValidEmail = /* @__PURE__ */ __name2((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "isValidEmail");
var getEmailDomain = /* @__PURE__ */ __name2((email) => email.split("@")[1]?.toLowerCase() || "", "getEmailDomain");
var looksLikeHtml = /* @__PURE__ */ __name2((value) => /<\/?[a-z][\s\S]*>/i.test(value), "looksLikeHtml");
var escapeHtml = /* @__PURE__ */ __name2((value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"), "escapeHtml");
var createEmailBody = /* @__PURE__ */ __name2((input) => {
  const subject = `${site.name} \u6703\u54E1\u5BC6\u78BC`;
  const plainText = [
    `${site.name} \u6703\u54E1\u8A3B\u518A\u5B8C\u6210`,
    "",
    `\u4F60\u597D\uFF0C${input.name}`,
    "",
    `\u4F60\u7684\u81E8\u6642\u5BC6\u78BC\u662F\uFF1A${input.temporaryPassword}`,
    `\u767B\u5165\u9801\u9762\uFF1A${input.loginUrl}`,
    "",
    "\u767B\u5165\u5F8C\u8ACB\u5148\u66F4\u6539\u5BC6\u78BC\u3002"
  ].join("\n");
  const html = `
    <div style="font-family: Arial, 'Noto Sans TC', sans-serif; line-height: 1.7; color: #2d3436;">
      <h2 style="margin: 0 0 12px;">${escapeHtml(site.name)} \u6703\u54E1\u8A3B\u518A\u5B8C\u6210</h2>
      <p style="margin: 0 0 12px;">\u4F60\u597D\uFF0C${escapeHtml(input.name)}</p>
      <p style="margin: 0 0 12px;">\u4F60\u7684\u81E8\u6642\u5BC6\u78BC\u662F\uFF1A</p>
      <div style="padding: 14px 16px; background: #fff5f0; border: 1px solid #ffd2c8; border-radius: 12px; font-size: 20px; font-weight: 800; letter-spacing: 0.08em;">
        ${escapeHtml(input.temporaryPassword)}
      </div>
      <p style="margin: 16px 0 12px;">\u767B\u5165\u9801\u9762\uFF1A<a href="${escapeHtml(input.loginUrl)}">${escapeHtml(input.loginUrl)}</a></p>
      <p style="margin: 0;">\u767B\u5165\u5F8C\u8ACB\u5148\u66F4\u6539\u5BC6\u78BC\u3002</p>
    </div>
  `;
  return {
    subject,
    plainText,
    html
  };
}, "createEmailBody");
var resolveRegistrationEmailConfig = /* @__PURE__ */ __name2((input) => {
  const mailChannelsApiKey = input.mailChannelsApiKey?.trim() || "";
  const fromEmail = input.fromEmail?.trim() || "";
  const fromName = input.fromName?.trim() || site.name;
  const mailChannelsEndpoint = input.mailChannelsEndpoint?.trim() || DEFAULT_MAILCHANNELS_ENDPOINT;
  if (!mailChannelsApiKey) {
    throw new RegistrationEmailError("config", "\u6703\u54E1\u5BC4\u4FE1\u529F\u80FD\u5C1A\u672A\u8A2D\u5B9A\u5B8C\u6210\uFF0C\u8ACB\u5148\u8A2D\u5B9A `MAILCHANNELS_API_KEY`\u3002");
  }
  if (!fromEmail) {
    throw new RegistrationEmailError("config", "\u6703\u54E1\u5BC4\u4FE1\u529F\u80FD\u5C1A\u672A\u8A2D\u5B9A\u5B8C\u6210\uFF0C\u8ACB\u5148\u8A2D\u5B9A `MAIL_FROM_ADDRESS`\u3002");
  }
  if (!isValidEmail(fromEmail)) {
    throw new RegistrationEmailError("config", "\u5BC4\u4EF6\u5730\u5740\u683C\u5F0F\u4E0D\u6B63\u78BA\uFF0C\u8ACB\u6AA2\u67E5 `MAIL_FROM_ADDRESS`\u3002");
  }
  if (getEmailDomain(fromEmail).endsWith(".pages.dev")) {
    throw new RegistrationEmailError("config", "\u5BC4\u4EF6\u5730\u5740\u4E0D\u80FD\u4F7F\u7528 `pages.dev` \u7DB2\u57DF\uFF0C\u8ACB\u6539\u7528\u4F60\u81EA\u5DF1\u7684\u7DB2\u57DF\u4FE1\u7BB1\u3002");
  }
  return {
    mailChannelsApiKey,
    fromEmail,
    fromName,
    mailChannelsEndpoint
  };
}, "resolveRegistrationEmailConfig");
var getMailChannelsErrorMessage = /* @__PURE__ */ __name2(async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (response.status === 401 || response.status === 403) {
    return "\u5BC4\u4FE1\u670D\u52D9\u9A57\u8B49\u5931\u6557\uFF0C\u8ACB\u6AA2\u67E5 `MAILCHANNELS_API_KEY`\u3001\u5BC4\u4EF6\u7DB2\u57DF SPF \u8207 `_mailchannels` TXT \u8A18\u9304\u3002";
  }
  if (contentType.includes("application/json")) {
    const payload = await response.json().catch(() => null);
    const message = typeof payload?.message === "string" && payload.message.trim() || typeof payload?.error === "string" && payload.error.trim() || Array.isArray(payload?.errors) && typeof payload.errors[0]?.message === "string" && payload.errors[0].message.trim() || "";
    if (message) {
      return `\u5BC4\u4FE1\u5931\u6557\uFF1A${message}`;
    }
  }
  const rawMessage = await response.text().catch(() => "");
  if (rawMessage && !looksLikeHtml(rawMessage)) {
    return `\u5BC4\u4FE1\u5931\u6557\uFF1A${rawMessage.slice(0, 180)}`;
  }
  if (response.status >= 500) {
    return "\u5BC4\u4FE1\u670D\u52D9\u66AB\u6642\u7121\u6CD5\u4F7F\u7528\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002";
  }
  return "\u5BC4\u4FE1\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002";
}, "getMailChannelsErrorMessage");
var assertRegistrationEmailConfig = /* @__PURE__ */ __name2((input) => {
  resolveRegistrationEmailConfig(input);
}, "assertRegistrationEmailConfig");
var sendRegistrationEmail = /* @__PURE__ */ __name2(async (input) => {
  const { fromEmail, fromName, mailChannelsApiKey, mailChannelsEndpoint } = resolveRegistrationEmailConfig(input);
  const { subject, plainText, html } = createEmailBody(input);
  const payload = {
    personalizations: [
      {
        to: [
          {
            email: input.to,
            name: input.name
          }
        ]
      }
    ],
    from: {
      email: fromEmail,
      name: fromName
    },
    subject,
    content: [
      { type: "text/plain", value: plainText },
      { type: "text/html", value: html }
    ]
  };
  const response = await fetch(mailChannelsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": mailChannelsApiKey
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new RegistrationEmailError("delivery", await getMailChannelsErrorMessage(response));
  }
}, "sendRegistrationEmail");
var getMemberByEmail = /* @__PURE__ */ __name2(async (db, email) => {
  if (!db || !email)
    return null;
  const result = await db.prepare(
    `
      SELECT
        id,
        email,
        name,
        password_hash,
        password_salt,
        must_change_password,
        created_at,
        updated_at
      FROM members
      WHERE email = ?
      LIMIT 1
      `
  ).bind(email).first();
  return result ?? null;
}, "getMemberByEmail");
var getMemberById = /* @__PURE__ */ __name2(async (db, memberId) => {
  if (!db || !memberId)
    return null;
  const result = await db.prepare(
    `
      SELECT
        id,
        email,
        name,
        password_hash,
        password_salt,
        must_change_password,
        created_at,
        updated_at
      FROM members
      WHERE id = ?
      LIMIT 1
      `
  ).bind(memberId).first();
  return result ?? null;
}, "getMemberById");
var createMember = /* @__PURE__ */ __name2(async (db, input) => {
  if (!db)
    return null;
  await db.prepare(
    `
      INSERT INTO members (
        id,
        email,
        name,
        password_hash,
        password_salt,
        must_change_password
      ) VALUES (?, ?, ?, ?, ?, ?)
      `
  ).bind(input.id, input.email, input.name, input.passwordHash, input.passwordSalt, input.mustChangePassword === false ? 0 : 1).run();
  return getMemberById(db, input.id);
}, "createMember");
var createMemberSession = /* @__PURE__ */ __name2(async (db, input) => {
  if (!db)
    return null;
  const tokenHash = await hashSessionToken(input.token);
  await db.prepare(
    `
      INSERT INTO member_sessions (
        id,
        member_id,
        token_hash,
        expires_at
      ) VALUES (?, ?, ?, ?)
      `
  ).bind(input.id, input.memberId, tokenHash, input.expiresAt).run();
  return {
    id: input.id,
    memberId: input.memberId,
    tokenHash,
    expiresAt: input.expiresAt
  };
}, "createMemberSession");
var getSessionMember = /* @__PURE__ */ __name2(async (db, token) => {
  if (!db || !token)
    return null;
  const tokenHash = await hashSessionToken(token);
  const session = await db.prepare(
    `
      SELECT
        member_sessions.id,
        member_sessions.member_id,
        member_sessions.token_hash,
        member_sessions.expires_at,
        member_sessions.revoked_at,
        members.must_change_password,
        members.email,
        members.name,
        members.created_at,
        members.updated_at
      FROM member_sessions
      INNER JOIN members ON members.id = member_sessions.member_id
      WHERE member_sessions.token_hash = ?
      LIMIT 1
      `
  ).bind(tokenHash).first();
  if (!session || session.revoked_at)
    return null;
  if (new Date(session.expires_at).getTime() <= Date.now())
    return null;
  await db.prepare(
    `
      UPDATE member_sessions
      SET last_seen_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `
  ).bind(session.id).run();
  return toPublicMember({
    id: session.member_id,
    email: session.email,
    name: session.name,
    created_at: session.created_at,
    updated_at: session.updated_at,
    must_change_password: session.must_change_password
  });
}, "getSessionMember");
var updateMemberPassword = /* @__PURE__ */ __name2(async (db, input) => {
  if (!db)
    return null;
  await db.prepare(
    `
      UPDATE members
      SET
        password_hash = ?,
        password_salt = ?,
        must_change_password = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `
  ).bind(input.passwordHash, input.passwordSalt, input.memberId).run();
  return getMemberById(db, input.memberId);
}, "updateMemberPassword");
var revokeSession = /* @__PURE__ */ __name2(async (db, token) => {
  if (!db || !token)
    return;
  const tokenHash = await hashSessionToken(token);
  await db.prepare(
    `
      UPDATE member_sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = ?
      `
  ).bind(tokenHash).run();
}, "revokeSession");
var pets = [
  {
    id: "xiaohuang",
    name: "\u5C0F\u9EC3",
    species: "dog",
    gender: "male",
    age: "2 \u6B72",
    ageGroup: "adult",
    size: "\u4E2D\u578B\u72AC",
    sizeGroup: "medium",
    location: "\u53F0\u5317\u5E02",
    locationKey: "taipei",
    emoji: "\u{1F415}",
    badge: { label: "\u6025\u9700\u9818\u990A", tone: "urgent" },
    description: "\u500B\u6027\u6EAB\u548C\u89AA\u4EBA\uFF0C\u559C\u6B61\u6563\u6B65\u548C\u73A9\u7403\uFF0C\u9069\u5408\u6709\u9662\u5B50\u7684\u5BB6\u5EAD\u3002",
    tags: ["\u89AA\u4EBA", "\u6D3B\u6F51", "\u5DF2\u7D50\u7D2E"],
    story: "\u5C0F\u9EC3\u539F\u672C\u88AB\u6551\u63F4\u6642\u5F88\u81BD\u5C0F\uFF0C\u73FE\u5728\u5DF2\u7D93\u5B78\u6703\u5B89\u5FC3\u5730\u9760\u8FD1\u4EBA\u3002"
  },
  {
    id: "mimi",
    name: "\u54AA\u54AA",
    species: "cat",
    gender: "female",
    age: "1 \u6B72",
    ageGroup: "adult",
    size: "\u5C0F\u578B\u8C93",
    sizeGroup: "small",
    location: "\u65B0\u5317\u5E02",
    locationKey: "newtaipei",
    emoji: "\u{1F408}",
    description: "\u5B89\u975C\u4E56\u5DE7\uFF0C\u559C\u6B61\u66EC\u592A\u967D\u548C\u88AB\u6478\u6478\uFF0C\u9069\u5408\u516C\u5BD3\u98FC\u990A\u3002",
    tags: ["\u5B89\u975C", "\u7368\u7ACB", "\u5DF2\u7D50\u7D2E"],
    story: "\u54AA\u54AA\u6700\u559C\u6B61\u7A97\u908A\u7684\u4F4D\u7F6E\uFF0C\u6703\u5B89\u975C\u966A\u4F34\u6BCF\u4E00\u500B\u56DE\u5BB6\u7684\u665A\u4E0A\u3002"
  },
  {
    id: "lucky",
    name: "Lucky",
    species: "dog",
    gender: "male",
    age: "5 \u6B72",
    ageGroup: "adult",
    size: "\u5927\u578B\u72AC",
    sizeGroup: "large",
    location: "\u6843\u5712\u5E02",
    locationKey: "taoyuan",
    emoji: "\u{1F415}\u200D\u{1F9BA}",
    description: "\u5FE0\u8AA0\u53EF\u9760\uFF0C\u5DF2\u8A13\u7DF4\u826F\u597D\uFF0C\u9069\u5408\u6709\u7D93\u9A57\u7684\u98FC\u4E3B\u3002",
    tags: ["\u5FE0\u8AA0", "\u8070\u660E", "\u5DF2\u8A13\u7DF4"],
    story: "Lucky \u66FE\u7D93\u6D41\u6D6A\u5F88\u4E45\uFF0C\u73FE\u5728\u53EA\u60F3\u627E\u4E00\u500B\u80FD\u966A\u4ED6\u6563\u6B65\u7684\u5BB6\u3002"
  },
  {
    id: "chengzi",
    name: "\u6A58\u5B50",
    species: "cat",
    gender: "male",
    age: "3 \u500B\u6708",
    ageGroup: "young",
    size: "\u5E7C\u8C93",
    sizeGroup: "small",
    location: "\u53F0\u4E2D\u5E02",
    locationKey: "taichung",
    emoji: "\u{1F431}",
    badge: { label: "\u65B0\u5230", tone: "new" },
    description: "\u6D3B\u6F51\u597D\u52D5\u7684\u5C0F\u6A58\u8C93\uFF0C\u5145\u6EFF\u597D\u5947\u5FC3\uFF0C\u7B49\u5F85\u7B2C\u4E00\u500B\u5BB6\u3002",
    tags: ["\u6D3B\u6F51", "\u597D\u5947", "\u5065\u5EB7"],
    story: "\u6A58\u5B50\u7E3D\u662F\u7B2C\u4E00\u500B\u8DD1\u4F86\u63A2\u7D22\u65B0\u4E8B\u7269\uFF0C\u662F\u4E00\u5718\u53EF\u611B\u7684\u5C0F\u706B\u7403\u3002"
  }
];
var allowed = {
  type: ["all", "dog", "cat", "other"],
  age: ["any", "young", "adult", "senior"],
  size: ["any", "small", "medium", "large"],
  area: ["all", "taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung"]
};
var normalizeFilterValue = /* @__PURE__ */ __name2((key, value) => {
  const fallback = key === "age" || key === "size" ? "any" : "all";
  const normalized = (value || fallback).toString();
  return allowed[key].includes(normalized) ? normalized : fallback;
}, "normalizeFilterValue");
var filterPets = /* @__PURE__ */ __name2((items, filters) => {
  const type = normalizeFilterValue("type", filters.type);
  const age = normalizeFilterValue("age", filters.age);
  const size = normalizeFilterValue("size", filters.size);
  const area = normalizeFilterValue("area", filters.area);
  return items.filter((pet) => {
    const isVisible = !pet.status || pet.status === "available";
    const matchType = type === "all" || pet.species === type;
    const matchAge = age === "any" || pet.ageGroup === age;
    const matchSize = size === "any" || pet.sizeGroup === size;
    const matchArea = area === "all" || pet.locationKey === area;
    return isVisible && matchType && matchAge && matchSize && matchArea;
  });
}, "filterPets");
var findPetById = /* @__PURE__ */ __name2((id) => pets.find((pet) => pet.id === id), "findPetById");
var createPetApiPayload = /* @__PURE__ */ __name2((items, filters = {}) => {
  const visibleItems = items.filter((pet) => !pet.status || pet.status === "available");
  const results = filterPets(visibleItems, filters);
  return {
    total: visibleItems.length,
    count: results.length,
    filters: {
      type: normalizeFilterValue("type", filters.type),
      age: normalizeFilterValue("age", filters.age),
      size: normalizeFilterValue("size", filters.size),
      area: normalizeFilterValue("area", filters.area)
    },
    results
  };
}, "createPetApiPayload");
var parseTags = /* @__PURE__ */ __name2((value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}, "parseTags");
var toPet = /* @__PURE__ */ __name2((row) => ({
  id: row.id,
  name: row.name,
  species: row.species,
  gender: row.gender,
  age: row.age,
  ageGroup: row.age_group,
  size: row.size,
  sizeGroup: row.size_group,
  location: row.location,
  locationKey: row.location_key,
  emoji: row.emoji,
  badge: row.badge_label ? { label: row.badge_label, tone: row.badge_tone ?? "default" } : void 0,
  description: row.description,
  tags: parseTags(row.tags_json),
  story: row.story
}), "toPet");
var getFavoritesFromDatabase = /* @__PURE__ */ __name2(async (db, clientId) => {
  if (!db || !clientId) {
    return [];
  }
  const result = await db.prepare(
    `
      SELECT
        favorites.id AS favorite_id,
        favorites.created_at AS favorite_created_at,
        pets.id,
        pets.name,
        pets.species,
        pets.gender,
        pets.age,
        pets.age_group,
        pets.size,
        pets.size_group,
        pets.location,
        pets.location_key,
        pets.emoji,
        pets.badge_label,
        pets.badge_tone,
        pets.description,
        pets.story,
        pets.tags_json,
        pets.sort_order
      FROM favorites
      INNER JOIN pets ON pets.id = favorites.pet_id
      WHERE favorites.user_id = ?
      ORDER BY favorites.created_at DESC, pets.sort_order ASC, pets.name ASC
      `
  ).bind(clientId).all();
  return result.results.map((row) => ({
    favoriteId: row.favorite_id,
    favoriteCreatedAt: row.favorite_created_at,
    pet: toPet(row)
  }));
}, "getFavoritesFromDatabase");
var shelters = [
  {
    id: "taipei-animal-home",
    icon: "\u{1F3E5}",
    name: "\u53F0\u5317\u5E02\u52D5\u7269\u4E4B\u5BB6",
    description: "\u5C08\u696D\u7684\u7167\u8B77\u5718\u968A\uFF0C\u63D0\u4F9B\u5B8C\u5584\u7684\u91AB\u7642\u670D\u52D9",
    location: "\u53F0\u5317\u5E02",
    availablePets: 328
  },
  {
    id: "loving-foster-home",
    icon: "\u2764\uFE0F",
    name: "\u611B\u5FC3\u4E2D\u9014\u4E4B\u5BB6",
    description: "\u7531\u5FD7\u5DE5\u7D93\u71DF\uFF0C\u7D66\u4E88\u6BDB\u5B69\u5BB6\u5EAD\u822C\u7684\u6EAB\u6696",
    location: "\u65B0\u5317\u5E02",
    availablePets: 156
  },
  {
    id: "stray-association",
    icon: "\u{1F31F}",
    name: "\u6D6A\u6D6A\u5225\u54ED\u5354\u6703",
    description: "\u81F4\u529B\u65BC\u6D41\u6D6A\u52D5\u7269\u6551\u63F4\u8207\u9001\u990A",
    location: "\u6843\u5712\u5E02",
    availablePets: 203
  },
  {
    id: "happy-fur-home",
    icon: "\u{1F3E1}",
    name: "\u5E78\u798F\u6BDB\u5B69\u4E2D\u9014",
    description: "\u63D0\u4F9B\u5B89\u5168\u8212\u9069\u7684\u4E2D\u9014\u74B0\u5883",
    location: "\u53F0\u4E2D\u5E02",
    availablePets: 189
  }
];
var stories = [
  {
    id: "max",
    title: "Max \u627E\u5230\u4E86\u4ED6\u7684\u5BB6\u4EBA",
    quote: "Max \u4F86\u5230\u6211\u5011\u5BB6\u5F8C\uFF0C\u6574\u500B\u5BB6\u90FD\u5145\u6EFF\u4E86\u6B61\u7B11\u3002\u4ED6\u4E0D\u53EA\u662F\u5BF5\u7269\uFF0C\u66F4\u662F\u6211\u5011\u7684\u5BB6\u4EBA\u3002",
    author: "\u738B\u5C0F\u660E",
    date: "\u9818\u990A\u65BC 2024 \u5E74 3 \u6708",
    avatar: "\u738B",
    emoji: "\u{1F415}\u2764\uFE0F\u{1F468}\u200D\u{1F469}\u200D\u{1F467}"
  },
  {
    id: "luna",
    title: "Luna \u7684\u7B2C\u4E8C\u6B21\u6A5F\u6703",
    quote: "Luna \u525B\u4F86\u6642\u5F88\u5BB3\u7F9E\uFF0C\u4F46\u73FE\u5728\u5979\u662F\u6211\u6700\u597D\u7684\u5925\u4F34\u3002\u6BCF\u5929\u4E0B\u73ED\u56DE\u5BB6\u770B\u5230\u5979\uFF0C\u6240\u6709\u75B2\u618A\u90FD\u6D88\u5931\u4E86\u3002",
    author: "\u674E\u7F8E\u73B2",
    date: "\u9818\u990A\u65BC 2024 \u5E74 1 \u6708",
    avatar: "\u674E",
    emoji: "\u{1F408}\u2764\uFE0F\u{1F469}"
  },
  {
    id: "bobby",
    title: "\u8001\u5E74\u72AC Bobby \u7684\u5E78\u798F\u665A\u5E74",
    quote: "\u5F88\u591A\u4EBA\u4E0D\u9858\u610F\u9818\u990A\u8001\u72D7\uFF0C\u4F46 Bobby \u7D66\u6211\u5011\u5E36\u4F86\u4E86\u7121\u6BD4\u7684\u6EAB\u6696\u3002\u4ED6\u5B89\u975C\u3001\u61C2\u4E8B\uFF0C\u662F\u6700\u5B8C\u7F8E\u7684\u966A\u4F34\u3002",
    author: "\u9673\u5148\u751F\u592B\u5A66",
    date: "\u9818\u990A\u65BC 2023 \u5E74 11 \u6708",
    avatar: "\u9673",
    emoji: "\u{1F415}\u200D\u{1F9BA}\u2764\uFE0F\u{1F474}\u{1F475}"
  }
];
var sortByOrder = /* @__PURE__ */ __name2((items) => [...items], "sortByOrder");
var toStory = /* @__PURE__ */ __name2((row) => ({
  id: row.id,
  title: row.title,
  quote: row.quote,
  author: row.author,
  date: row.date,
  avatar: row.avatar,
  emoji: row.emoji
}), "toStory");
var toShelter = /* @__PURE__ */ __name2((row) => ({
  id: row.id,
  icon: row.icon,
  name: row.name,
  description: row.description,
  location: row.location,
  availablePets: row.available_pets
}), "toShelter");
var getStoriesFromDatabase = /* @__PURE__ */ __name2(async (db) => {
  if (!db) {
    return sortByOrder(stories);
  }
  const result = await db.prepare(
    `
      SELECT
        id,
        title,
        quote,
        author,
        date,
        avatar,
        emoji,
        sort_order
      FROM stories
      ORDER BY sort_order ASC, date DESC
      `
  ).all();
  if (!result.results.length) {
    return sortByOrder(stories);
  }
  return result.results.map(toStory);
}, "getStoriesFromDatabase");
var getSheltersFromDatabase = /* @__PURE__ */ __name2(async (db) => {
  if (!db) {
    return sortByOrder(shelters);
  }
  const result = await db.prepare(
    `
      SELECT
        id,
        icon,
        name,
        description,
        location,
        available_pets,
        sort_order
      FROM shelters
      ORDER BY sort_order ASC, name ASC
      `
  ).all();
  if (!result.results.length) {
    return sortByOrder(shelters);
  }
  return result.results.map(toShelter);
}, "getSheltersFromDatabase");
var parseTags2 = /* @__PURE__ */ __name2((value) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}, "parseTags");
var toPet2 = /* @__PURE__ */ __name2((row) => ({
  id: row.id,
  name: row.name,
  species: row.species,
  gender: row.gender,
  age: row.age,
  ageGroup: row.age_group,
  size: row.size,
  sizeGroup: row.size_group,
  location: row.location,
  locationKey: row.location_key,
  emoji: row.emoji,
  status: row.status ?? "available",
  badge: row.badge_label ? { label: row.badge_label, tone: row.badge_tone ?? "default" } : void 0,
  description: row.description,
  tags: parseTags2(row.tags_json),
  story: row.story
}), "toPet");
var sortFallbackPets = /* @__PURE__ */ __name2(() => [...pets], "sortFallbackPets");
var getPetsFromDatabase = /* @__PURE__ */ __name2(async (db) => {
  if (!db) {
    return sortFallbackPets();
  }
  const result = await db.prepare(
    `
      SELECT
        id,
        name,
        species,
        gender,
        age,
        age_group,
        size,
        size_group,
        location,
        location_key,
        emoji,
        status,
        badge_label,
        badge_tone,
        description,
        story,
        tags_json,
        sort_order
      FROM pets
      ORDER BY sort_order ASC, name ASC
      `
  ).all();
  if (!result.results.length) {
    return sortFallbackPets();
  }
  return result.results.map(toPet2);
}, "getPetsFromDatabase");
var getPetByIdFromDatabase = /* @__PURE__ */ __name2(async (db, id) => {
  if (!db) {
    return pets.find((pet) => pet.id === id) ?? null;
  }
  const result = await db.prepare(
    `
      SELECT
        id,
        name,
        species,
        gender,
        age,
        age_group,
        size,
        size_group,
        location,
        location_key,
        emoji,
        status,
        badge_label,
        badge_tone,
        description,
        story,
        tags_json,
        sort_order
      FROM pets
      WHERE id = ?
      LIMIT 1
      `
  ).bind(id).first();
  return result ? toPet2(result) : null;
}, "getPetByIdFromDatabase");
var parseLimit = /* @__PURE__ */ __name2((value, fallback = 10, max = 20) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}, "parseLimit");
var parseTagsJson = /* @__PURE__ */ __name2((value) => {
  if (!value)
    return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}, "parseTagsJson");
var isSecureRequest = /* @__PURE__ */ __name2((url) => new URL(url).protocol === "https:", "isSecureRequest");
var isLocalOrigin = /* @__PURE__ */ __name2((origin) => origin === "http://localhost:4321" || origin === "http://127.0.0.1:4321", "isLocalOrigin");
var app = new Hono2().basePath("/api");
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  if (origin && isLocalOrigin(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type");
    c.header("Vary", "Origin");
  }
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }
  await next();
});
app.get(
  "/",
  (c) => c.json({
    name: "PawsHome API",
    version: "1.2.0",
    dataSource: "Cloudflare D1 paws",
    endpoints: [
      "GET /api/auth/me",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/pets",
      "GET /api/pets/:id",
      "GET /api/stories",
      "GET /api/shelters",
      "GET /api/favorites",
      "GET /api/admin/summary",
      "GET /api/admin/adoptions",
      "GET /api/admin/adoptions/:id",
      "GET /api/admin/pets",
      "GET /api/admin/pets/:id",
      "PATCH /api/admin/pets/:id",
      "GET /api/admin/favorites",
      "PATCH /api/admin/adoptions/:id",
      "POST /api/adoptions",
      "POST /api/favorites",
      "DELETE /api/favorites"
    ]
  })
);
app.get("/auth/me", async (c) => {
  const token = getCookie(c, AUTH_COOKIE_NAME) || "";
  const member = await getSessionMember(c.env.paws, token);
  if (!member) {
    return c.json({ ok: false, message: "\u5C1A\u672A\u767B\u5165\u3002" }, 401);
  }
  return c.json({
    ok: true,
    member
  });
});
app.post("/auth/register", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const body = await c.req.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const name = typeof body?.name === "string" ? normalizeName(body.name) : "";
  if (!email || !name) {
    return c.json({ ok: false, message: "name\u3001email \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  if (name.length < 2) {
    return c.json({ ok: false, message: "\u59D3\u540D\u81F3\u5C11\u9700\u8981 2 \u500B\u5B57\u5143\u3002" }, 400);
  }
  try {
    assertRegistrationEmailConfig({
      to: email,
      name,
      temporaryPassword: "placeholder",
      loginUrl: new URL("/auth/login", c.req.url).toString(),
      fromEmail: c.env.MAIL_FROM_ADDRESS,
      fromName: c.env.MAIL_FROM_NAME,
      mailChannelsApiKey: c.env.MAILCHANNELS_API_KEY,
      mailChannelsEndpoint: c.env.MAILCHANNELS_ENDPOINT
    });
  } catch (error) {
    return c.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "\u6703\u54E1\u5BC4\u4FE1\u8A2D\u5B9A\u5C1A\u672A\u5B8C\u6210\u3002"
      },
      503
    );
  }
  const existing = await getMemberByEmail(db, email);
  if (existing) {
    return c.json({ ok: false, message: "\u9019\u500B Email \u5DF2\u7D93\u8A3B\u518A\u904E\u4E86\u3002" }, 409);
  }
  const memberId = crypto.randomUUID();
  const temporaryPassword = createTemporaryPassword();
  const passwordSalt = createSalt();
  const passwordHash = await hashPassword(temporaryPassword, passwordSalt);
  const member = await createMember(db, {
    id: memberId,
    email,
    name,
    passwordHash,
    passwordSalt,
    mustChangePassword: true
  });
  if (!member) {
    return c.json({ ok: false, message: "\u5EFA\u7ACB\u6703\u54E1\u5931\u6557\u3002" }, 500);
  }
  const loginUrl = new URL("/auth/login", c.req.url).toString();
  try {
    await sendRegistrationEmail({
      to: email,
      name,
      temporaryPassword,
      loginUrl,
      fromEmail: c.env.MAIL_FROM_ADDRESS,
      fromName: c.env.MAIL_FROM_NAME,
      mailChannelsApiKey: c.env.MAILCHANNELS_API_KEY,
      mailChannelsEndpoint: c.env.MAILCHANNELS_ENDPOINT
    });
  } catch (error) {
    await db.prepare(
      `
        DELETE FROM members
        WHERE id = ?
        `
    ).bind(memberId).run();
    return c.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "\u5BC4\u4FE1\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66\u3002"
      },
      502
    );
  }
  return c.json({
    ok: true,
    message: "\u8A3B\u518A\u5B8C\u6210\uFF0C\u8ACB\u5230 Email \u6536\u53D6\u5BC6\u78BC\u3002",
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      mustChangePassword: true
    }
  }, 201);
});
app.post("/auth/login", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const body = await c.req.json().catch(() => null);
  const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return c.json({ ok: false, message: "email \u8207 password \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  const member = await getMemberByEmail(db, email);
  if (!member) {
    return c.json({ ok: false, message: "\u5E33\u865F\u6216\u5BC6\u78BC\u932F\u8AA4\u3002" }, 401);
  }
  const isValid = await verifyPassword(password, member.password_salt, member.password_hash);
  if (!isValid) {
    return c.json({ ok: false, message: "\u5E33\u865F\u6216\u5BC6\u78BC\u932F\u8AA4\u3002" }, 401);
  }
  const token = createSessionToken();
  await createMemberSession(db, {
    id: crypto.randomUUID(),
    memberId: member.id,
    token,
    expiresAt: sessionExpiresAt()
  });
  setCookie(c, AUTH_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: isSecureRequest(c.req.url),
    maxAge: 60 * 60 * 24 * 30
  });
  return c.json({
    ok: true,
    message: "\u767B\u5165\u6210\u529F\u3002",
    member: {
      id: member.id,
      email: member.email,
      name: member.name,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      mustChangePassword: Boolean(member.must_change_password)
    }
  });
});
app.patch("/auth/password", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const token = getCookie(c, AUTH_COOKIE_NAME) || "";
  const member = await getSessionMember(db, token);
  if (!member) {
    return c.json({ ok: false, message: "\u5C1A\u672A\u767B\u5165\u3002" }, 401);
  }
  const body = await c.req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const nextPassword = typeof body?.nextPassword === "string" ? body.nextPassword : "";
  if (!currentPassword || !nextPassword) {
    return c.json({ ok: false, message: "currentPassword \u8207 nextPassword \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  if (nextPassword.length < 8) {
    return c.json({ ok: false, message: "\u65B0\u5BC6\u78BC\u81F3\u5C11\u9700\u8981 8 \u500B\u5B57\u5143\u3002" }, 400);
  }
  const memberRecord = await getMemberById(db, member.id);
  if (!memberRecord) {
    return c.json({ ok: false, message: "\u627E\u4E0D\u5230\u6703\u54E1\u8CC7\u6599\u3002" }, 404);
  }
  const currentValid = await verifyPassword(currentPassword, memberRecord.password_salt, memberRecord.password_hash);
  if (!currentValid) {
    return c.json({ ok: false, message: "\u76EE\u524D\u5BC6\u78BC\u4E0D\u6B63\u78BA\u3002" }, 401);
  }
  const nextSalt = createSalt();
  const nextHash = await hashPassword(nextPassword, nextSalt);
  const updated = await updateMemberPassword(db, {
    memberId: member.id,
    passwordHash: nextHash,
    passwordSalt: nextSalt
  });
  return c.json({
    ok: true,
    message: "\u5BC6\u78BC\u5DF2\u66F4\u65B0\u3002",
    member: updated ? {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      mustChangePassword: false
    } : member
  });
});
app.post("/auth/logout", async (c) => {
  const db = c.env.paws;
  const token = getCookie(c, AUTH_COOKIE_NAME) || "";
  if (db && token) {
    await revokeSession(db, token);
  }
  deleteCookie(c, AUTH_COOKIE_NAME, { path: "/" });
  return c.json({
    ok: true,
    message: "\u5DF2\u767B\u51FA\u3002"
  });
});
app.get("/pets", async (c) => {
  const pets2 = await getPetsFromDatabase(c.env.paws);
  const payload = createPetApiPayload(pets2, {
    type: c.req.query("type"),
    age: c.req.query("age"),
    size: c.req.query("size"),
    area: c.req.query("area")
  });
  return c.json(payload);
});
app.get("/pets/:id", async (c) => {
  const id = c.req.param("id");
  const pet = await getPetByIdFromDatabase(c.env.paws, id) ?? findPetById(id);
  if (!pet) {
    return c.json({ error: "Pet not found" }, 404);
  }
  if (pet.status && pet.status !== "available") {
    return c.json({ error: "Pet not available" }, 404);
  }
  return c.json({ pet });
});
app.get("/stories", async (c) => {
  const stories2 = await getStoriesFromDatabase(c.env.paws);
  return c.json({
    total: stories2.length,
    results: stories2
  });
});
app.get("/shelters", async (c) => {
  const shelters2 = await getSheltersFromDatabase(c.env.paws);
  return c.json({
    total: shelters2.length,
    results: shelters2
  });
});
app.get("/favorites", async (c) => {
  const clientId = c.req.query("clientId")?.trim() ?? "";
  const favorites = await getFavoritesFromDatabase(c.env.paws, clientId);
  return c.json({
    total: favorites.length,
    results: favorites
  });
});
app.get("/admin/summary", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const summary = await db.prepare(
    `
      SELECT
        (SELECT COUNT(*) FROM pets) AS total_pets,
        (SELECT COUNT(*) FROM adoption_requests) AS total_adoptions,
        (SELECT COUNT(*) FROM adoption_requests WHERE status = 'pending') AS pending_adoptions,
        (SELECT COUNT(*) FROM favorites) AS total_favorites,
        (SELECT COUNT(DISTINCT user_id) FROM favorites) AS favorite_users
      `
  ).first();
  return c.json({
    ok: true,
    summary: {
      totalPets: summary?.total_pets ?? 0,
      totalAdoptions: summary?.total_adoptions ?? 0,
      pendingAdoptions: summary?.pending_adoptions ?? 0,
      totalFavorites: summary?.total_favorites ?? 0,
      favoriteUsers: summary?.favorite_users ?? 0
    }
  });
});
app.get("/admin/adoptions", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const limit = parseLimit(c.req.query("limit"), 10, 20);
  const result = await db.prepare(
    `
      SELECT
        adoption_requests.id,
        adoption_requests.pet_id,
        adoption_requests.full_name,
        adoption_requests.email,
        adoption_requests.phone,
        adoption_requests.note,
        adoption_requests.status,
        adoption_requests.created_at,
        adoption_requests.updated_at,
        pets.name AS pet_name,
        pets.emoji AS pet_emoji,
        pets.location AS pet_location
      FROM adoption_requests
      LEFT JOIN pets ON pets.id = adoption_requests.pet_id
      ORDER BY adoption_requests.created_at DESC
      LIMIT ?
      `
  ).bind(limit).all();
  return c.json({
    ok: true,
    total: result.results.length,
    results: result.results.map((row) => ({
      id: row.id,
      petId: row.pet_id,
      petName: row.pet_name ?? "\u672A\u77E5\u6BDB\u5B69",
      petEmoji: row.pet_emoji ?? "\u{1F43E}",
      petLocation: row.pet_location ?? "\u672A\u77E5\u5730\u5340",
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      note: row.note,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  });
});
app.get("/admin/adoptions/:id", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const id = c.req.param("id").trim();
  if (!id) {
    return c.json({ ok: false, message: "\u7533\u8ACB ID \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  const result = await db.prepare(
    `
      SELECT
        adoption_requests.id,
        adoption_requests.pet_id,
        adoption_requests.full_name,
        adoption_requests.email,
        adoption_requests.phone,
        adoption_requests.note,
        adoption_requests.status,
        adoption_requests.created_at,
        adoption_requests.updated_at,
        pets.name AS pet_name,
        pets.species AS pet_species,
        pets.gender AS pet_gender,
        pets.age AS pet_age,
        pets.age_group AS pet_age_group,
        pets.size AS pet_size,
        pets.size_group AS pet_size_group,
        pets.location AS pet_location,
        pets.location_key AS pet_location_key,
        pets.emoji AS pet_emoji,
        pets.badge_label AS pet_badge_label,
        pets.badge_tone AS pet_badge_tone,
        pets.description AS pet_description,
        pets.story AS pet_story,
        pets.tags_json AS pet_tags_json
      FROM adoption_requests
      LEFT JOIN pets ON pets.id = adoption_requests.pet_id
      WHERE adoption_requests.id = ?
      LIMIT 1
      `
  ).bind(id).first();
  if (!result) {
    return c.json({ ok: false, message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u7533\u8ACB\u3002" }, 404);
  }
  return c.json({
    ok: true,
    adoption: {
      id: result.id,
      petId: result.pet_id,
      pet: {
        id: result.pet_id,
        name: result.pet_name ?? "\u672A\u77E5\u6BDB\u5B69",
        species: result.pet_species ?? "other",
        gender: result.pet_gender ?? "male",
        age: result.pet_age ?? "",
        ageGroup: result.pet_age_group ?? "adult",
        size: result.pet_size ?? "",
        sizeGroup: result.pet_size_group ?? "medium",
        location: result.pet_location ?? "\u672A\u77E5\u5730\u5340",
        locationKey: result.pet_location_key ?? "taipei",
        emoji: result.pet_emoji ?? "\u{1F43E}",
        badge: result.pet_badge_label ? { label: result.pet_badge_label, tone: result.pet_badge_tone ?? "default" } : void 0,
        description: result.pet_description ?? "",
        story: result.pet_story ?? "",
        tags: parseTagsJson(result.pet_tags_json)
      },
      fullName: result.full_name,
      email: result.email,
      phone: result.phone,
      note: result.note,
      status: result.status,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    }
  });
});
app.get("/admin/pets", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const result = await getPetsFromDatabase(db);
  return c.json({
    ok: true,
    total: result.length,
    results: result.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      gender: pet.gender,
      age: pet.age,
      ageGroup: pet.ageGroup,
      size: pet.size,
      sizeGroup: pet.sizeGroup,
      location: pet.location,
      locationKey: pet.locationKey,
      emoji: pet.emoji,
      status: pet.status ?? "available",
      badge: pet.badge,
      description: pet.description,
      story: pet.story,
      tags: pet.tags
    }))
  });
});
app.get("/admin/pets/:id", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const id = c.req.param("id").trim();
  if (!id) {
    return c.json({ ok: false, message: "\u6BDB\u5B69 ID \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  const result = await db.prepare(
    `
      SELECT
        id,
        name,
        species,
        gender,
        age,
        age_group,
        size,
        size_group,
        location,
        location_key,
        emoji,
        status,
        badge_label,
        badge_tone,
        description,
        story,
        tags_json,
        sort_order
      FROM pets
      WHERE id = ?
      LIMIT 1
      `
  ).bind(id).first();
  if (!result) {
    return c.json({ ok: false, message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u6BDB\u5B69\u3002" }, 404);
  }
  return c.json({
    ok: true,
    pet: {
      id: result.id,
      name: result.name,
      species: result.species,
      gender: result.gender,
      age: result.age,
      ageGroup: result.age_group,
      size: result.size,
      sizeGroup: result.size_group,
      location: result.location,
      locationKey: result.location_key,
      emoji: result.emoji,
      status: result.status ?? "available",
      badge: result.badge_label ? { label: result.badge_label, tone: result.badge_tone ?? "default" } : void 0,
      description: result.description,
      story: result.story,
      tags: parseTagsJson(result.tags_json),
      sortOrder: result.sort_order
    }
  });
});
app.patch("/admin/pets/:id", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const id = c.req.param("id").trim();
  const body = await c.req.json().catch(() => null);
  const allowedSpecies = /* @__PURE__ */ new Set(["dog", "cat", "other"]);
  const allowedGender = /* @__PURE__ */ new Set(["male", "female"]);
  const allowedAgeGroup = /* @__PURE__ */ new Set(["young", "adult", "senior"]);
  const allowedSizeGroup = /* @__PURE__ */ new Set(["small", "medium", "large"]);
  const allowedLocationKey = /* @__PURE__ */ new Set(["taipei", "newtaipei", "taoyuan", "taichung", "tainan", "kaohsiung"]);
  const allowedBadgeTone = /* @__PURE__ */ new Set(["urgent", "new", "default"]);
  const allowedStatus = /* @__PURE__ */ new Set(["available", "hidden", "adopted"]);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const species = typeof body?.species === "string" ? body.species.trim() : "";
  const gender = typeof body?.gender === "string" ? body.gender.trim() : "";
  const age = typeof body?.age === "string" ? body.age.trim() : "";
  const ageGroup = typeof body?.ageGroup === "string" ? body.ageGroup.trim() : "";
  const size = typeof body?.size === "string" ? body.size.trim() : "";
  const sizeGroup = typeof body?.sizeGroup === "string" ? body.sizeGroup.trim() : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";
  const locationKey = typeof body?.locationKey === "string" ? body.locationKey.trim() : "";
  const emoji = typeof body?.emoji === "string" ? body.emoji.trim() : "";
  const status = typeof body?.status === "string" ? body.status.trim() : "";
  const badgeLabel = typeof body?.badgeLabel === "string" ? body.badgeLabel.trim() : "";
  const badgeTone = typeof body?.badgeTone === "string" ? body.badgeTone.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const story = typeof body?.story === "string" ? body.story.trim() : "";
  const tagsInput = Array.isArray(body?.tags) ? body.tags : [];
  const tags = tagsInput.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
  const sortOrder = Number(body?.sortOrder);
  if (!id) {
    return c.json({ ok: false, message: "\u6BDB\u5B69 ID \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  if (!name || !allowedSpecies.has(species) || !allowedGender.has(gender) || !age || !allowedAgeGroup.has(ageGroup) || !size || !allowedSizeGroup.has(sizeGroup) || !location || !allowedLocationKey.has(locationKey) || !emoji || !allowedStatus.has(status) || !description || !story || !Number.isFinite(sortOrder)) {
    return c.json(
      {
        ok: false,
        message: "\u8ACB\u78BA\u8A8D\u6BDB\u5B69\u57FA\u672C\u8CC7\u6599\u7686\u5DF2\u586B\u5BEB\uFF0C\u4E14\u5206\u985E\u6B04\u4F4D\u7B26\u5408\u898F\u683C\u3002"
      },
      400
    );
  }
  if (badgeTone && !allowedBadgeTone.has(badgeTone)) {
    return c.json(
      {
        ok: false,
        message: "badgeTone \u53EA\u63A5\u53D7 urgent\u3001new\u3001default\u3002"
      },
      400
    );
  }
  const existing = await db.prepare(
    `
      SELECT id
      FROM pets
      WHERE id = ?
      LIMIT 1
      `
  ).bind(id).first();
  if (!existing) {
    return c.json({ ok: false, message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u6BDB\u5B69\u3002" }, 404);
  }
  await db.prepare(
    `
      UPDATE pets
      SET
        name = ?,
        species = ?,
        gender = ?,
        age = ?,
        age_group = ?,
        size = ?,
        size_group = ?,
        location = ?,
        location_key = ?,
        emoji = ?,
        status = ?,
        badge_label = ?,
        badge_tone = ?,
        description = ?,
        story = ?,
        tags_json = ?,
        sort_order = ?
      WHERE id = ?
      `
  ).bind(
    name,
    species,
    gender,
    age,
    ageGroup,
    size,
    sizeGroup,
    location,
    locationKey,
    emoji,
    status,
    badgeLabel || null,
    badgeLabel ? badgeTone || "default" : null,
    description,
    story,
    JSON.stringify(tags),
    Math.floor(sortOrder),
    id
  ).run();
  return c.json({
    ok: true,
    message: "\u6BDB\u5B69\u8CC7\u6599\u5DF2\u66F4\u65B0\u3002",
    pet: {
      id,
      name,
      species,
      gender,
      age,
      ageGroup,
      size,
      sizeGroup,
      location,
      locationKey,
      emoji,
      status,
      badge: badgeLabel ? { label: badgeLabel, tone: badgeTone || "default" } : void 0,
      description,
      story,
      tags,
      sortOrder: Math.floor(sortOrder)
    }
  });
});
app.get("/admin/favorites", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const limit = parseLimit(c.req.query("limit"), 10, 20);
  const result = await db.prepare(
    `
      SELECT
        favorites.id AS favorite_id,
        favorites.user_id AS client_id,
        favorites.created_at AS favorite_created_at,
        pets.id,
        pets.name,
        pets.species,
        pets.gender,
        pets.age,
        pets.age_group,
        pets.size,
        pets.size_group,
        pets.location,
        pets.location_key,
        pets.emoji,
        pets.badge_label,
        pets.badge_tone,
        pets.description,
        pets.story,
        pets.tags_json,
        pets.sort_order
      FROM favorites
      INNER JOIN pets ON pets.id = favorites.pet_id
      ORDER BY favorites.created_at DESC
      LIMIT ?
      `
  ).bind(limit).all();
  return c.json({
    ok: true,
    total: result.results.length,
    results: result.results.map((row) => ({
      favoriteId: row.favorite_id,
      clientId: row.client_id,
      favoriteCreatedAt: row.favorite_created_at,
      pet: {
        id: row.id,
        name: row.name,
        species: row.species,
        gender: row.gender,
        age: row.age,
        ageGroup: row.age_group,
        size: row.size,
        sizeGroup: row.size_group,
        location: row.location,
        locationKey: row.location_key,
        emoji: row.emoji,
        badge: row.badge_label ? { label: row.badge_label, tone: row.badge_tone ?? "default" } : void 0,
        description: row.description,
        story: row.story,
        tags: parseTagsJson(row.tags_json)
      }
    }))
  });
});
app.patch("/admin/adoptions/:id", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const id = c.req.param("id").trim();
  const body = await c.req.json().catch(() => null);
  const nextStatus = typeof body?.status === "string" ? body.status.trim() : "";
  const allowedStatuses = /* @__PURE__ */ new Set(["pending", "approved", "rejected"]);
  if (!id) {
    return c.json({ ok: false, message: "\u7533\u8ACB ID \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002" }, 400);
  }
  if (!allowedStatuses.has(nextStatus)) {
    return c.json(
      {
        ok: false,
        message: "status \u53EA\u63A5\u53D7 pending\u3001approved\u3001rejected\u3002"
      },
      400
    );
  }
  const existing = await db.prepare(
    `
      SELECT id
      FROM adoption_requests
      WHERE id = ?
      LIMIT 1
      `
  ).bind(id).first();
  if (!existing) {
    return c.json({ ok: false, message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u7533\u8ACB\u3002" }, 404);
  }
  await db.prepare(
    `
      UPDATE adoption_requests
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `
  ).bind(nextStatus, id).run();
  return c.json({
    ok: true,
    message: `\u7533\u8ACB\u5DF2\u66F4\u65B0\u70BA ${nextStatus}\u3002`,
    adoption: {
      id,
      status: nextStatus
    }
  });
});
app.post("/adoptions", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const body = await c.req.json().catch(() => null);
  const petId = typeof body?.petId === "string" ? body.petId.trim() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (!petId || !fullName || !email || !phone) {
    return c.json(
      {
        ok: false,
        message: "petId\u3001fullName\u3001email\u3001phone \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002"
      },
      400
    );
  }
  const pet = await getPetByIdFromDatabase(db, petId);
  if (!pet) {
    return c.json(
      {
        ok: false,
        message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u6BDB\u5B69\u3002"
      },
      404
    );
  }
  const id = crypto.randomUUID();
  await db.prepare(
    `
      INSERT INTO adoption_requests (
        id,
        pet_id,
        full_name,
        email,
        phone,
        note,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `
  ).bind(id, petId, fullName, email, phone, note || null).run();
  return c.json(
    {
      ok: true,
      message: "\u9818\u990A\u7533\u8ACB\u5DF2\u9001\u51FA\uFF0C\u8ACB\u7559\u610F\u5F8C\u7E8C\u806F\u7D61\u3002",
      request: {
        id,
        petId,
        petName: pet.name,
        fullName,
        email,
        phone,
        note: note || null,
        status: "pending"
      }
    },
    201
  );
});
app.post("/favorites", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const body = await c.req.json().catch(() => null);
  const petId = typeof body?.petId === "string" ? body.petId.trim() : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";
  if (!petId || !clientId) {
    return c.json(
      {
        ok: false,
        message: "petId \u8207 clientId \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002"
      },
      400
    );
  }
  const pet = await getPetByIdFromDatabase(db, petId);
  if (!pet) {
    return c.json(
      {
        ok: false,
        message: "\u627E\u4E0D\u5230\u6307\u5B9A\u7684\u6BDB\u5B69\u3002"
      },
      404
    );
  }
  const favoriteId = crypto.randomUUID();
  await db.prepare(
    `
      DELETE FROM favorites
      WHERE pet_id = ? AND user_id = ?
      `
  ).bind(petId, clientId).run();
  await db.prepare(
    `
      INSERT INTO favorites (
        id,
        pet_id,
        user_id
      ) VALUES (?, ?, ?)
      `
  ).bind(favoriteId, petId, clientId).run();
  return c.json(
    {
      ok: true,
      message: "\u6536\u85CF\u5DF2\u52A0\u5165\u3002",
      favorite: {
        id: favoriteId,
        petId,
        petName: pet.name,
        clientId
      }
    },
    201
  );
});
app.delete("/favorites", async (c) => {
  const db = c.env.paws;
  if (!db) {
    return c.json({ ok: false, message: "D1 binding paws is not available." }, 503);
  }
  const body = await c.req.json().catch(() => null);
  const petId = typeof body?.petId === "string" ? body.petId.trim() : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";
  if (!clientId) {
    return c.json(
      {
        ok: false,
        message: "clientId \u70BA\u5FC5\u586B\u6B04\u4F4D\u3002"
      },
      400
    );
  }
  if (petId) {
    await db.prepare(
      `
        DELETE FROM favorites
        WHERE pet_id = ? AND user_id = ?
        `
    ).bind(petId, clientId).run();
  } else {
    await db.prepare(
      `
        DELETE FROM favorites
        WHERE user_id = ?
        `
    ).bind(clientId).run();
  }
  return c.json({
    ok: true,
    message: petId ? "\u6536\u85CF\u5DF2\u79FB\u9664\u3002" : "\u6536\u85CF\u5DF2\u5168\u90E8\u6E05\u7A7A\u3002",
    favorite: {
      clientId,
      ...petId ? { petId } : {}
    }
  });
});
var onRequest = handle(app);
var routes = [
  {
    routePath: "/api/:path*",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse2");
__name2(parse2, "parse");
function match2(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match2, "match2");
__name2(match2, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse2(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = /* @__PURE__ */ __name(class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
}, "__Facade_ScheduledController__");
__name2(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/.pnpm/wrangler@3.114.16_@cloudflare+workers-types@4.20260101.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/.pnpm/wrangler@3.114.16_@cloudflare+workers-types@4.20260101.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-ASWDPW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/.pnpm/wrangler@3.114.16_@cloudflare+workers-types@4.20260101.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-ASWDPW/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__2, "__Facade_ScheduledController__");
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.22901393987538365.js.map
