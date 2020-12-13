import Peer from "peerjs";

let _peer: Peer | null = null;
let peerId: string | null = null;
let _conn: Peer.DataConnection | null = null;

let ended = false;

function process() {
  console.log("processing");
}

function begin(peer: Peer, conn: Peer.DataConnection) {
  conn.on("data", function (data: string) {
    switch (data) {
      case "move":
        process();

        break;
    }
  });
  conn.on("close", function () {
    if (!ended) {
      alert("partner quit");
    }
  });
  peer.on("error", function (err) {
    alert("" + err);
  });
}

export const go = function (event?: unknown) {
  if (_conn) {
    _conn.send("move");

    process();
  } else {
    alert("not ready 42");
  }
};

function initialize() {
  _peer = new Peer("", {
    //   host: location.hostname,
    //   port: location.port || (location.protocol === "https:" ? 443 : 80),
    //   path: "/peerjs",
    debug: 3,
  });
  _peer.on("open", function (id) {
    peerId = id;
  });
  _peer.on("error", function (err) {
    alert("" + err);
  });

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
}

export function start() {
  initialize();
  if (_peer) {
    _peer.on("open", function () {
      // go
      alert("Ask your friend to join using your peer ID: " + peerId);
    });
    _peer.on("connection", function (c) {
      if (_conn) {
        c.close();
        return;
      }
      _conn = c;
      begin(_peer!, _conn);
    });
  }
}

export function join(destId: string) {
  initialize();
  if (_peer) {
    _peer.on("open", function () {
      if (_peer) {
        _conn = _peer.connect(destId, {
          reliable: true,
        });
        _conn.on("open", function () {
          begin(_peer!, _conn!);
        });
      }
    });
  } else {
    alert("not ready 104");
  }
}
