import { serveHttp, tb, ws } from "./deps.ts";

import { apiPort } from "../common/constants.ts";
import dataDir from "./dataDir.ts";
import SQLiteDatabase from "./SQLiteDatabase.ts";
import implementProtocol from "../common/implementProtocol.ts";
import Protocol from "../common/Protocol.ts";
import WebSocketBufferIO from "../common/WebSocketBufferIO.ts";

export default async function serve() {
  const db = new SQLiteDatabase(`${dataDir}/db.sqlite`);
  const protocolImpl = implementProtocol(db);

  for await (const req of serveHttp(`http://127.0.0.1:${apiPort}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;

    ws.acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    }).then((sock) => {
      const bufferIO = new WebSocketBufferIO(sock);
      tb.serveProtocol(bufferIO, Protocol, protocolImpl);
    });
  }
}
