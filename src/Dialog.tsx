import React, { FC, useCallback, useState } from "react";

import { Observer, Observable } from "rxjs";
import { useSubscribe } from "./hooks";

export const Dialog: FC<{
  toPartner: Observer<string>;
  fromPartner: Observable<string>;
}> = ({ toPartner, fromPartner }) => {
  const [message, setMessage] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  useSubscribe(fromPartner, (s) => {
    setHistory((h) => [...h, s]);
  });
  const send = useCallback(() => {
    console.log({ toPartner });

    toPartner.next(message);
    setMessage("");
  }, [message, toPartner]);
  return (
    <div style={{ width: 150, height: 200, border: "thin solid black" }}>
      <div>{history}</div>
      <input
        onChange={(e) => setMessage(e.currentTarget.value)}
        value={message}
      />
      <button onClick={send}>Send</button>
    </div>
  );
};
