


import { useState, useCallback } from "react";
import { toast } from "sonner";

function useFetch<T, A>(cb: (arg: A) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // memoize fn so it doesn't change on every render
  const fn = useCallback(async (arg: A): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(arg);
      setData(response);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [cb]);

  return { data, loading, error, fn, setData };
}

export default useFetch;
