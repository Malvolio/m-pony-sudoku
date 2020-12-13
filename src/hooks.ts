import { fromPairs } from "lodash";
import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export const useSubscribe = <T>(
  obs: Observable<T> | undefined,
  fc: (t: T) => void
) => {
  useEffect(() => {
    const sub = obs?.subscribe(fc);
    return () => {
      sub?.unsubscribe();
    };
  }, [fc, obs]);
};

const parseHash = (s: string): { [k: string]: string } =>
  fromPairs(
    s
      .replace(/^#/, "")
      .split("&")
      .map((p) => p.split("=").map(decodeURIComponent))
  );

export const useHash = (): { [k: string]: string | undefined } => {
  const [hash, setHash] = useState(parseHash(window.location.hash));
  useEffect(() => {
    const update = () => {
      setHash(parseHash(window.location.hash));
    };
    window.addEventListener("hashchange", update, false);
    return () => {
      window.removeEventListener("hashchange", update);
    };
  }, []);
  return hash;
};
