import React, { FC } from "react";
import "./App.css";
import { useServiceConnection, useClientConnection } from "./ReactPeer";
import { Game } from "./Game";
import { useHash } from "./hooks";

const composeUrl = (peerId: string): string =>
  `${window.location.protocol}//${window.location.host}${window.location.pathname}#peerid=${peerId}`;

const Listen: FC<{ code?: string }> = ({ code }) => {
  const { connected, peerId, toPartner, fromPartner } = useServiceConnection();
  return (
    <div>
      {peerId && !connected && <p>{composeUrl(peerId)}</p>}
      <Game
        toPartner={toPartner}
        fromPartner={fromPartner}
        connected={connected}
        code={code}
      />
    </div>
  );
};

const Connect: FC<{ peerId: string }> = ({ peerId }) => {
  const { connected, toPartner, fromPartner } = useClientConnection(peerId);

  return (
    <div>
      {connected && <Game toPartner={toPartner} fromPartner={fromPartner} />}
    </div>
  );
};

function App() {
  const { peerid, solo, code } = useHash();
  return (
    <div className="App">
      <h2>M-Pony Sudoku </h2>
      {solo && <Game code={code} />}
      {!solo && !peerid && <Listen code={code} />}
      {!solo && !!peerid && <Connect peerId={peerid} />}
    </div>
  );
}

export default App;
