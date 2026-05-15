'use client';

const DB_NAME = 'gwaaImages';
const DB_VER = 4;
const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const STORES = {
  HERO:     'heroImages',
  ACTIVITY: 'activityCards',
  EVENT:    'eventCards',
  LOOKBOOK: 'lookbookItems',
  ARCHIVE:  'archiveEvents',
  PLACES:   'travelPlaces',
  HASHTAGS: 'pageHashtags',
  MATESHIP: 'mateshipPartners',
  GALLERY:  'galleryItems',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

let _db: IDBDatabase | null = null;

function open(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onerror = () => rej(req.error);
    req.onblocked = () => rej(new Error('다른 탭에서 DB가 열려 있습니다. 다른 탭을 닫고 새로고침 해주세요.'));
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      _db.onversionchange = () => { _db?.close(); _db = null; };
      res(_db);
    };
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.HERO))
        db.createObjectStore(STORES.HERO, { keyPath: 'id' });
      [STORES.ACTIVITY, STORES.EVENT, STORES.LOOKBOOK].forEach(name => {
        if (!db.objectStoreNames.contains(name))
          db.createObjectStore(name, { keyPath: 'id', autoIncrement: true });
      });
      if (!db.objectStoreNames.contains(STORES.ARCHIVE))
        db.createObjectStore(STORES.ARCHIVE, { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains(STORES.PLACES))
        db.createObjectStore(STORES.PLACES, { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains(STORES.HASHTAGS))
        db.createObjectStore(STORES.HASHTAGS, { keyPath: 'page' });
      if (!db.objectStoreNames.contains(STORES.MATESHIP))
        db.createObjectStore(STORES.MATESHIP, { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains(STORES.GALLERY))
        db.createObjectStore(STORES.GALLERY, { keyPath: 'id', autoIncrement: true });
    };
  });
}

async function getAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    req.onsuccess = () => res((req.result as T[]).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
    req.onerror = () => rej(req.error);
  });
}

async function get<T>(storeName: StoreName, id: number | string): Promise<T | undefined> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).get(id);
    req.onsuccess = () => res(req.result as T);
    req.onerror = () => rej(req.error);
  });
}

async function add<T>(storeName: StoreName, item: T): Promise<IDBValidKey> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).add(item);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function put<T>(storeName: StoreName, item: T): Promise<IDBValidKey> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).put(item);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

async function remove(storeName: StoreName, id: number | string): Promise<void> {
  const db = await open();
  return new Promise((res, rej) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
    req.onsuccess = () => res();
    req.onerror = () => rej(req.error);
  });
}

let _initPromise: Promise<void> | null = null;

async function initDefaults(): Promise<void> {
  if (_initPromise) return _initPromise;
  const { DEFAULTS, DEFAULT_HASHTAGS } = await import('./defaults');
  _initPromise = (async () => {
    for (const [storeName, items] of Object.entries(DEFAULTS)) {
      const existing = await getAll(storeName as StoreName);
      if (existing.length === 0) {
        for (const item of items as any[]) await add(storeName as StoreName, item);
      }
    }
    for (let i = 1; i <= 3; i++) {
      const h = await get(STORES.HERO, i);
      if (!h) await put(STORES.HERO, { id: i, imageData: null });
    }
    for (const ht of DEFAULT_HASHTAGS) {
      const existing = await get(STORES.HASHTAGS, ht.page);
      if (!existing) await put(STORES.HASHTAGS, ht);
    }
  })();
  return _initPromise;
}

function validateImage(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED.has(file.type)) return { ok: false, error: 'JPG, PNG, WebP 형식만 가능합니다.' };
  if (file.size > MAX_SIZE) return { ok: false, error: `2MB 이하만 가능합니다. (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)` };
  return { ok: true };
}

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res((e.target as FileReader).result as string);
    r.onerror = () => rej(new Error('파일 읽기 실패'));
    r.readAsDataURL(file);
  });
}

export const gwaaDB = { STORES, open, getAll, get, add, put, remove, initDefaults, validateImage, toBase64 };
