import { serveHttp, tb, ws } from "./deps.ts";

import { apiPort, databasesDirname } from "../common/constants.ts";
import dataDir from "./dataDir.ts";
import SQLiteDatabase from "./SQLiteDatabase.ts";
import implementProtocol from "../common/implementProtocol.ts";
import Protocol from "../common/Protocol.ts";
import DenoWebSocketBufferIO from "./DenoWebSocketBufferIO.ts";
import DbMetadata from "./DbMetadata.ts";

export default async function serve() {
  const databasesDir = `${dataDir}/${databasesDirname}`;

  const index = tb.JSON.parse(
    tb.Array(DbMetadata),
    await Deno.readTextFile(`${databasesDir}/index.json`),
  );

  const dbMap = new Map(index.map(
    ({ name, filename }) => [
      name,
      new SQLiteDatabase(`${databasesDir}/${filename}`),
    ],
  ));

  const protocolImpl = implementProtocol(dbMap);

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
