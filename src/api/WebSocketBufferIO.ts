import type { ws } from "../../deps.ts";
import { tb } from "../../deps.ts";

export default class WebSocketBufferIO implements tb.BufferIO {
  queue = new tb.AsyncQueue<Uint8Array>();

  constructor(public socket: WebSocket | ws.WebSocket) {
    if (this.isClosed()) {
      this.queue.close();
    }

    if (socket instanceof WebSocket) {
      socket.addEventListener("close", () => this.queue.close());

      socket.addEventListener("message", async ({ data }) => {
        if (!(data instanceof Blob)) {
          throw new Error("Expected Uint8Array");
        }

        this.queue.push(new Uint8Array(await data.arrayBuffer()));
      });
    } else {
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
  }

  async write(buffer: Uint8Array): Promise<void> {
    if (this.isClosed()) {
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

  private isClosed(): boolean {
    if (this.socket instanceof WebSocket) {
      return this.socket.readyState === WebSocket.CLOSED;
    }

    return this.socket.isClosed;
  }
}
