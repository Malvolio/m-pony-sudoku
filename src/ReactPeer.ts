import Peer from "peerjs";
import { useEffect, useMemo, useState } from "react";
import { Observable, Observer, ReplaySubject } from "rxjs";

function begin(
  peer: Peer,
  conn: Peer.DataConnection,
  fromPartner: Observer<string>,
  toPartner: Observable<string>,
  onClose: () => void
) {
  const sub = toPartner.subscribe((s) => conn.send(s));

  conn.on("data", (s) => fromPartner.next(s));
  conn.on("close", function () {
    console.log("partner quit");
    sub.unsubscribe();
    onClose();
  });
  peer.on("error", function (err) {
    console.log("" + err);
    sub.unsubscribe();
    onClose();
  });
}

const usePeer = () => {
  const [peerId, setPeerId] = useState<string>();
  const peer = useMemo(() => {
    const peer = new Peer("", {
      // debug: 3,
    });

    peer.on("open", setPeerId);
    peer.on("error", function (err) {
      console.log("" + err);
    });
    return peer;
  }, []);

  // Heroku HTTP routing timeout rule (https://devcenter.heroku.com/articles/websockets#timeouts) workaround
  // function ping() {
  //   if (peer) {
  //     peer.socket.send({
  //       type: "ping",
  //     });
  //   }
  //   setTimeout(ping, 16000);
  // }

  // ping();
  return { peer, peerId };
};

export function useServiceConnection(): {
  peerId: string | undefined;
  connected: boolean;
  toPartner: Observer<string>;
  fromPartner: Observable<string>;
} {
  const [connected, setConnected] = useState(false);
  const { peer, peerId } = usePeer();
  const toPartner = useMemo(() => new ReplaySubject<string>(1), []);
  const fromPartner = useMemo(() => new ReplaySubject<string>(1), []);
  useMemo(() => {
    peer.on("open", function () {
      console.log("connected");
    });
    peer.on("connection", function (c) {
      if (connected) {
        c.close();
        return;
      }
      setConnected(true);
      begin(peer, c, fromPartner, toPartner, () => setConnected(false));
    });
  }, [connected, fromPartner, peer, toPartner]);
  return { connected, peerId, toPartner, fromPartner };
}

export const useClientConnection = (
  destId: string
): {
  connected: boolean;
  toPartner: Observer<string>;
  fromPartner: Observable<string>;
} => {
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const { peer } = usePeer();
  const toPartner = useMemo(() => new ReplaySubject<string>(1), []);
  const fromPartner = useMemo(() => new ReplaySubject<string>(1), []);
  useMemo(() => {
    peer.on("open", () => {
      setOpen(true);
    });
  }, [peer]);

  useEffect(() => {
    if (open && destId && !connected) {
      const conn = peer.connect(destId, {
        reliable: false,
      });
      conn.on("open", () => {
        begin(peer, conn, fromPartner, toPartner, () => setConnected(false));
        setConnected(true);
      });
    }
  }, [connected, destId, fromPartner, open, peer, toPartner]);

  return { connected, toPartner, fromPartner };
};
