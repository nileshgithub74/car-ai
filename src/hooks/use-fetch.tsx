import { useState } from "react";
import { toast } from "sonner";

// Generic hook: T = response type, A = arguments tuple
function useFetch<T, A extends unknown[]>(cb: (...args: A) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: A): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}

export default useFetch;
