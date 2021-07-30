import { tb, ws } from "./deps.ts";

/**
 * Unfortunately, a Deno WebSocket is different from a standard WebSocket.
 *
 * Deno knows about standard WebSockets too, so a (new WebSocket(...)) in Deno
 * should be able to use common/WebSocketBufferIO.
 */
export default class DenoWebSocketBufferIO implements tb.BufferIO {
  queue = new tb.AsyncQueue<Uint8Array>();

  constructor(public socket: ws.WebSocket) {
    if (this.socket.isClosed) {
      this.queue.close();
    }

    (async () => {
      for await (const data of socket) {
        if (!(data instanceof Uint8Array)) {
          // ignore: pings/etc... TODO: deal with strings?
        } else {
          this.queue.push(data);
        }
      }

      this.queue.close();
    })();
  }

  async write(buffer: Uint8Array): Promise<void> {
    if (this.socket.isClosed) {
      return; // TODO: Warn?
    }

    await this.socket.send(buffer);
  }

  async read(): Promise<Uint8Array | null> {
    return await this.queue.pop();
  }

  async close() {
    return await this.socket.close();
  }
}
