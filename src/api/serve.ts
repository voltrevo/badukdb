import { serveHttp, ws } from "../../deps.ts";
import { apiPort } from "../constants.ts";
import WebSocketBufferIO from "./WebSocketBufferIO.ts";

export default async function serveAPI() {
  for await (const req of serveHttp(`http://127.0.0.1:${apiPort}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req;

    ws.acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    }).then((sock) => {
      const bufferIO = new WebSocketBufferIO(sock);
    });
  }
}
