'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const vueDemi = require('vue-demi');
const sanityClient = require('@sanity/client');
const imageUrlBuilder = require('@sanity/image-url');
const minifier = require('minify-groq');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

const sanityClient__default = /*#__PURE__*/_interopDefaultLegacy(sanityClient);
const imageUrlBuilder__default = /*#__PURE__*/_interopDefaultLegacy(imageUrlBuilder);
const minifier__default = /*#__PURE__*/_interopDefaultLegacy(minifier);

const cache = vueDemi.reactive({});
function ensureInstance() {
  const instance = vueDemi.getCurrentInstance();
  if (!instance)
    throw new Error("You must call this from within a component");
  return instance.proxy;
}
function getServerInstance() {
  const instance = vueDemi.getCurrentInstance();
  if (process.env.VITE_SSG || instance?.proxy.$isServer)
    return instance?.proxy;
  return false;
}
function useCache(key, fetcher, options = {}) {
  const {
    initialValue = null,
    deduplicate = false,
    strategy = "both",
    clientOnly = false
  } = options;
  const enableSSR = !clientOnly && strategy !== "client";
  function initialiseCache({
    key: key2,
    value,
    error: error2 = null,
    status: status2 = "initialised",
    time = new Date().getTime()
  }) {
    vueDemi.set(cache, key2, [value, status2, time, error2]);
  }
  const serverInstance = getServerInstance();
  const k = vueDemi.unref(key);
  if (enableSSR && !serverInstance) {
    const prefetchState = window.__VSANITY_STATE__ || window.__NUXT__ && window.__NUXT__.vsanity;
    if (prefetchState && prefetchState[k]) {
      const [value, status2, time, error2] = prefetchState[k];
      initialiseCache({
        key: k,
        value,
        status: status2,
        time,
        error: error2
      });
    }
  }
  function verifyKey(key2) {
    const emptyCache = !(key2 in cache);
    if (emptyCache)
      initialiseCache({ key: key2, value: initialValue });
    return emptyCache || cache[key2][1] === "initialised";
  }
  function setCache({
    key: key2,
    value = cache[key2]?.[0] || initialValue,
    status: status2 = cache[key2]?.[1],
    error: error2 = null,
    promise = cache[key2]?.[4]
  }) {
    if (!(key2 in cache))
      initialiseCache({ key: key2, value, status: status2 });
    vueDemi.set(cache[key2], 0, value);
    vueDemi.set(cache[key2], 1, status2);
    vueDemi.set(cache[key2], 2, new Date().getTime());
    vueDemi.set(cache[key2], 3, error2);
    vueDemi.set(cache[key2], 4, promise);
  }
  function fetch(query = vueDemi.unref(key), force) {
    if (!force && query && cache[query] && cache[query][1] !== "error" && (cache[query][0] !== initialValue || cache[query][4] instanceof Promise) && deduplicate && (deduplicate === true || deduplicate < new Date().getTime() - cache[query][2]))
      return cache[query][4] instanceof Promise ? cache[query][4] : Promise.resolve(cache[query][0]);
    const promise = fetcher(query);
    setCache({ key: query, status: "loading", promise });
    promise.then((value) => setCache({
      key: query,
      value,
      status: serverInstance ? "server loaded" : "client loaded",
      promise: null
    })).catch((error2) => setCache({ key: query, status: "error", error: error2 }));
    return promise;
  }
  if (enableSSR && serverInstance) {
    const ctx = serverInstance.$ssrContext;
    if (ctx) {
      if (ctx.nuxt && !ctx.nuxt.vsanity) {
        ctx.nuxt.vsanity = {};
      } else if (!ctx.vsanity) {
        ctx.vsanity = {};
      }
    }
    vueDemi.onServerPrefetch(async () => {
      const k2 = vueDemi.unref(key);
      try {
        await fetch(k2, verifyKey(k2));
      } catch {
      }
      if (ctx && cache[k2] && !["loading", "initialised"].includes(cache[k2]?.[1])) {
        if (ctx.nuxt) {
          ctx.nuxt.vsanity[k2] = cache[k2].slice(0, 3);
        } else {
          ctx.vsanity[k2] = cache[k2].slice(0, 3);
        }
      }
    });
  }
  const data = vueDemi.computed(() => {
    const k2 = vueDemi.unref(key);
    if (!k2)
      return initialValue;
    verifyKey(k2);
    return cache[k2] && cache[k2][0];
  });
  const status = vueDemi.computed(() => {
    const k2 = vueDemi.unref(key);
    if (!k2)
      return "server loaded";
    verifyKey(k2);
    return cache[k2][1];
  });
  const error = vueDemi.computed(() => {
    const k2 = vueDemi.unref(key);
    if (!k2)
      return null;
    verifyKey(k2);
    return cache[k2][3];
  });
  if (vueDemi.isRef(key)) {
    vueDemi.watch(key, (key2) => {
      if (strategy === "server" && status.value === "server loaded")
        return;
      fetch(key2, verifyKey(key2));
    }, { immediate: true });
  } else if (strategy !== "server" || status.value !== "server loaded") {
    fetch(key, verifyKey(key));
  }
  return {
    setCache,
    triggerFetch: fetch,
    fetch,
    data,
    status,
    error
  };
}

const imageBuilderSymbol = Symbol("Sanity image URL builder");
function useSanityImage(image, options, widths = [300, 600, 1200, 1920]) {
  const builder = vueDemi.inject(imageBuilderSymbol);
  if (!builder)
    throw new Error("You must call useSanityClient before using sanity resources in this project.");
  function getImageUrl(image2, width, { quality = 82, fit = "min" }) {
    return builder.image(image2.url).width(Math.round(width)).quality(quality).fit(fit).url();
  }
  const result = vueDemi.computed(() => ({
    src: image.value.url,
    ...image.value.dimensions ? {
      srcset: [
        ...widths.map((width) => `${getImageUrl(image.value, width, options || {})} ${width}w`),
        `${image.value.url} ${image.value.dimensions.width}w`
      ].join(", "),
      placeholder: ""
    } : {
      srcset: [
        ...widths.map((width) => `${getImageUrl(image.value, width, options || {})} ${width}w`)
      ].join(", "),
      placeholder: ""
    }
  }));
  return result;
}

const clientSymbol = Symbol("Sanity client");
const previewClientSymbol = Symbol("Sanity client for previews");
const optionsSymbol = Symbol("Default query options");
function useSanityFetcher(query, initialValue = null, mapper = (result) => result, queryOptions) {
  const client = vueDemi.inject(clientSymbol);
  const defaultOptions = vueDemi.inject(optionsSymbol, {});
  const options = {
    ...defaultOptions,
    initialValue,
    ...queryOptions
  };
  if (!client)
    throw new Error("You must call useSanityClient before using sanity resources in this project.");
  const computedQuery = typeof query === "string" ? minifier__default(query).replace(/\n/g, " ") : vueDemi.computed(() => minifier__default(query() || "").replace(/\n/g, " "));
  const { data, status, setCache, error, fetch } = useCache(computedQuery, (query2) => query2 ? client.fetch(query2).then(mapper) : Promise.resolve(initialValue), options);
  if (options.listen) {
    const previewClient = vueDemi.inject(previewClientSymbol, client);
    if ("listen" in previewClient) {
      const listenOptions = typeof options.listen === "boolean" ? void 0 : options.listen;
      const subscribe = (query2) => previewClient.listen(query2, listenOptions).subscribe((event) => event.result && setCache({
        key: query2,
        value: event.result
      }));
      if (vueDemi.isRef(computedQuery)) {
        vueDemi.watch(computedQuery, (query2) => {
          const subscription = subscribe(query2);
          const unwatch = vueDemi.watch(computedQuery, (newQuery) => {
            if (newQuery !== query2) {
              subscription.unsubscribe();
              unwatch();
            }
          }, { immediate: true });
        }, { immediate: true });
      } else {
        subscribe(computedQuery);
      }
    }
  }
  return { data, status, error, fetch };
}
function useSanityQuery(builder, initialValue = null, mapper = (result) => result, options) {
  const query = "use" in builder ? () => builder.use()[0] : () => builder().use()[0];
  const type = "use" in builder ? builder.use()[1] : builder().use()[1];
  return useSanityFetcher(query, initialValue || type, mapper, options);
}

function useSanityClient(config, supportPreview = false, defaultOptions = {}) {
  ensureInstance();
  const client = sanityClient__default(config);
  const imageBuilder = imageUrlBuilder__default(config);
  vueDemi.provide(clientSymbol, client);
  vueDemi.provide(imageBuilderSymbol, imageBuilder);
  vueDemi.provide(optionsSymbol, defaultOptions);
  if (supportPreview) {
    const previewClient = sanityClient__default({
      ...config,
      useCdn: false,
      token: void 0,
      withCredentials: true
    });
    vueDemi.provide(previewClientSymbol, previewClient);
  }
}
function useCustomClient(client, defaultOptions = {}) {
  ensureInstance();
  vueDemi.provide(clientSymbol, client);
  vueDemi.provide(optionsSymbol, defaultOptions);
}
function fetch(query) {
  ensureInstance();
  const client = vueDemi.inject(clientSymbol);
  if (!client)
    throw new Error("You must call useSanityClient before using sanity resources in this project.");
  return client.fetch(query);
}

exports.fetch = fetch;
exports.useCache = useCache;
exports.useCustomClient = useCustomClient;
exports.useSanityClient = useSanityClient;
exports.useSanityFetcher = useSanityFetcher;
exports.useSanityImage = useSanityImage;
exports.useSanityQuery = useSanityQuery;
