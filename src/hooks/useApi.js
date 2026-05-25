import { useState, useEffect, useCallback } from 'react';

/**
 * useApi - replaces Convex useQuery with fetch + polling
 * @param {Function} fetcher - async function that returns data (from api.js)
 * @param {object} options - { enabled, interval, deps }
 */
export function useApi(fetcher, options = {}) {
  const { enabled = true, interval = 10000, deps = [] } = options;
  const [data, setData] = useState(undefined);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [enabled, ...deps]);

  useEffect(() => {
    load();
    if (interval > 0 && enabled) {
      const id = setInterval(load, interval);
      return () => clearInterval(id);
    }
  }, [load, interval, enabled]);

  return { data, error, loading, refetch: load };
}

/**
 * useMutate - wraps an API call for mutations
 */
export function useMutate(apiCall) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { mutate, loading, error };
}
