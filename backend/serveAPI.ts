import { serveHttp, tb, ws } from "./deps.ts";

import { apiPort, dbFilename } from "../common/constants.ts";
import dataDir from "./dataDir.ts";
import SQLiteDatabase from "./SQLiteDatabase.ts";
import implementProtocol from "../common/implementProtocol.ts";
import Protocol from "../common/Protocol.ts";
import DenoWebSocketBufferIO from "./DenoWebSocketBufferIO.ts";

export default async function serve() {
  const dbFilePath = `${dataDir}/${dbFilename}`;
  console.log(`Loading ${dbFilePath}`);
  const db = new SQLiteDatabase(dbFilePath);
  const protocolImpl = implementProtocol(db);

  for await (const req of serveHttp(`127.0.0.1:${apiPort}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;

    ws.acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    }).then((sock) => {
      const bufferIO = new DenoWebSocketBufferIO(sock);
      tb.serveProtocol(bufferIO, Protocol, protocolImpl);
    });
  }
}
