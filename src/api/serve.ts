import { serveHttp, tb, ws } from "../../deps.ts";

import { apiPort } from "../constants.ts";
import dataDir from "../dataDir.ts";
import SQLiteDatabase from "../SQLiteDatabase.ts";
import implementProtocol from "./implementProtocol.ts";
import Protocol from "./Protocol.ts";
import WebSocketBufferIO from "./WebSocketBufferIO.ts";

export default async function serveAPI() {
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
