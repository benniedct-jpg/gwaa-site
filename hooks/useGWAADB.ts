'use client';

import { useState, useEffect, useCallback } from 'react';
import { gwaaDB, StoreName } from '@/lib/db/gwaaDB';

let _initDone = false;
let _initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (_initDone) return Promise.resolve();
  if (!_initPromise) {
    _initPromise = gwaaDB.initDefaults().then(() => { _initDone = true; });
  }
  return _initPromise;
}

export function useGWAADB<T>(storeName: StoreName) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      await ensureInit();
      const result = await gwaaDB.getAll<T>(storeName);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => { load(); }, [load]);

  const put = useCallback(async (item: T) => {
    await gwaaDB.put<T>(storeName, item);
    await load();
  }, [storeName, load]);

  const remove = useCallback(async (id: number | string) => {
    await gwaaDB.remove(storeName, id);
    await load();
  }, [storeName, load]);

  return { data, loading, error, refresh: load, put, remove };
}

export function useGWAADBItem<T>(storeName: StoreName, id: number | string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === null) { setLoading(false); return; }
    (async () => {
      try {
        await ensureInit();
        const result = await gwaaDB.get<T>(storeName, id);
        setData(result ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [storeName, id]);

  return { data, loading };
}
