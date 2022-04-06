import { ClientConfig } from '@sanity/client'
import * as _vue_composition_api from '@vue/composition-api'
import { Ref } from 'vue-demi'
import {
  SanityImageDimensions,
  FitMode,
} from '@sanity/image-url/lib/types/types'
import { QueryBuilder } from 'sanity-typed-queries'

declare type FetchStatus =
  | 'initialised'
  | 'loading'
  | 'server loaded'
  | 'client loaded'
  | 'error'
interface SetCacheOptions<T, K> {
  key: string
  value?: T | K
  status?: FetchStatus
  error?: any
  promise?: Promise<T> | null
  time?: number
}
interface CacheOptions<K> {
  initialValue?: K
  /**
   * Whether to disable SSR fetching. Defaults to false. Now replaced with strategy: 'client'
   * @deprecated
   */
  clientOnly?: boolean
  /**
   * Strategy for fetching. Defaults to 'both'.
   * 'server' will not refetch if the cache has been populated on SSR.
   * 'client' will disable SSR fetching.
   * 'both' will fetch on server and refetch when page is loaded.
   */
  strategy?: 'server' | 'client' | 'both'
  /**
   * Whether to de-duplicate identical fetches. If set to `true`, additional fetches will not run unless made after
   * the previous request errors or succeeds. If set to a number, additional fetches will run, but only after this
   * many milliseconds after the previous fetch began.
   */
  deduplicate?: boolean | number
}
declare function useCache<T, K = null>(
  key: string | Ref<string>,
  fetcher: (key: string) => Promise<T>,
  options?: CacheOptions<K>
): {
  setCache: ({
    key,
    value,
    status,
    error,
    promise,
  }: SetCacheOptions<T, K>) => void
  triggerFetch: (query?: string, force?: boolean | undefined) => Promise<T>
  fetch: (query?: string, force?: boolean | undefined) => Promise<T>
  data: _vue_composition_api.ComputedRef<T | K | null>
  status: _vue_composition_api.ComputedRef<FetchStatus>
  error: _vue_composition_api.ComputedRef<any>
}

interface ResolvedSanityImage {
  url: string
  dimensions?: SanityImageDimensions
}
interface ImageOptions {
  dpr?: number
  quality?: number
  fit?: FitMode
}
/**
 *
 * WARNING. Work in progress. API may change.
 */
declare function useSanityImage(
  image: Ref<ResolvedSanityImage>,
  options?: Partial<ImageOptions>,
  widths?: number[]
): _vue_composition_api.ComputedRef<{
  srcset: string
  placeholder: string
  src: string
}>

interface Client {
  fetch: (query: string) => Promise<any>
  [key: string]: any
}
declare type Query = string | (() => string | null | undefined | false)
interface Result<T> {
  /**
   * An automatically synced and updated result of the Sanity query.
   */
  data: Ref<T>
  /**
   * The status of the query. Can be 'server loaded', 'loading', 'client loaded' or 'error'.
   */
  status: Ref<FetchStatus>
  /**
   * An error returned in the course of fetching
   */
  error: any
  /**
   * Get result directly from fetcher (integrates with cache)
   */
  fetch: () => Promise<T>
}
declare type Options = Omit<CacheOptions<any>, 'initialValue'> & {
  /**
   * Whether to listen to real-time updates from Sanity. You can also pass an object of options to pass to `client.listen`. Defaults to false.
   */
  listen?: boolean | Record<string, any>
}
/**
 *
 * @param query A string, or a function that retuns a query string. If the return value changes, a new Sanity query will be run and the return value automatically updated.
 */
declare function useSanityFetcher<T>(query: Query): Result<T | null>
/**
 *
 * @param query A function that retuns a query string. If the return value changes, a new Sanity query will be run and the return value automatically updated.
 * @param initialValue The value to return before the Sanity client returns an actual result. Defaults to null.
 * @param mapper A function that transforms the result from Sanity, before returning it to your component.
 */
declare function useSanityFetcher<T, R = T>(
  query: Query,
  initialValue: R,
  mapper?: (result: any) => T,
  options?: Options
): Result<T | R>
declare function useSanityQuery<
  Builder extends Pick<
    QueryBuilder<Schema, Mappings, Type, Project, Exclude>,
    'use'
  >,
  Schema,
  Mappings extends Record<string, any>,
  Type,
  Project extends boolean,
  Exclude extends string
>(
  builder: Builder | (() => Builder)
): Result<
  ReturnType<Builder['use']>[1] extends Array<any>
    ? ReturnType<Builder['use']>[1]
    : ReturnType<Builder['use']>[1] | null
>
declare function useSanityQuery<
  Builder extends Pick<
    QueryBuilder<Schema, Mappings, Type, Project, Exclude>,
    'use'
  >,
  Schema,
  Mappings extends Record<string, any>,
  Type,
  Project extends boolean,
  Exclude extends string
>(
  builder: Builder | (() => Builder),
  initialValue: null
): Result<ReturnType<Builder['use']>[1] | null>
declare function useSanityQuery<
  Builder extends Pick<
    QueryBuilder<Schema, Mappings, Type, Project, Exclude>,
    'use'
  >,
  Schema,
  Mappings extends Record<string, any>,
  Type,
  Project extends boolean,
  Exclude extends string,
  InitialValue
>(
  builder: Builder | (() => Builder),
  initialValue: InitialValue
): Result<ReturnType<Builder['use']>[1] | InitialValue>
declare function useSanityQuery<
  Builder extends Pick<
    QueryBuilder<Schema, Mappings, Type, Project, Exclude>,
    'use'
  >,
  Schema,
  Mappings extends Record<string, any>,
  Type,
  Project extends boolean,
  Exclude extends string,
  Mapper extends (result: ReturnType<Builder['use']>[1]) => any
>(
  builder: Builder | (() => Builder),
  initialValue: null,
  mapper: Mapper,
  options?: Options
): Result<ReturnType<Mapper> | null>
declare function useSanityQuery<
  Builder extends Pick<
    QueryBuilder<Schema, Mappings, Type, Project, Exclude>,
    'use'
  >,
  Schema,
  Mappings extends Record<string, any>,
  Type,
  Project extends boolean,
  Exclude extends string,
  InitialValue,
  Mapper extends (result: ReturnType<Builder['use']>[1]) => any
>(
  builder: Builder | (() => Builder),
  initialValue: InitialValue,
  mapper: Mapper,
  options?: Options
): Result<ReturnType<Mapper> | InitialValue>

interface RequiredConfig {
  /**
   * Your project ID. You can find it in your sanity.json.
   */
  projectId: string
  /**
   * You must specify which dataset to use. You can find it in your sanity.json.
   */
  dataset: string
}
/**
 *
 * @param supportPreview Whether to create a preview client (that won't use CDN, and supports credentials for viewing drafts). Defaults to false.
 */
declare function useSanityClient(
  config: ClientConfig & RequiredConfig,
  supportPreview?: boolean,
  defaultOptions?: Options
): void
declare function useCustomClient(client: Client, defaultOptions?: Options): void
declare function fetch(query: string): Promise<any>

export {
  CacheOptions,
  FetchStatus,
  Options,
  fetch,
  useCache,
  useCustomClient,
  useSanityClient,
  useSanityFetcher,
  useSanityImage,
  useSanityQuery,
}
