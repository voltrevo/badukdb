import { tb } from "./deps.ts";

export default class WebSocketBufferIO implements tb.BufferIO {
  queue = new tb.AsyncQueue<Uint8Array>();
  opened = false;
  preOpenMessages: Uint8Array[] = [];

  constructor(public socket: WebSocket) {
    if (this.socket.readyState === WebSocket.CLOSED) {
      this.queue.close();
    }

    socket.addEventListener("open", () => {
      this.opened = true;

      for (const msg of this.preOpenMessages) {
        this.socket.send(msg);
      }
    });

    socket.addEventListener("close", () => this.queue.close());

    socket.addEventListener("message", async ({ data }) => {
      if (!(data instanceof Blob)) {
        throw new Error("Expected Uint8Array");
      }

      this.queue.push(new Uint8Array(await data.arrayBuffer()));
    });
  }

  async write(buffer: Uint8Array): Promise<void> {
    if (this.socket.readyState === WebSocket.CLOSED) {
      return; // TODO: Warn?
    }

    if (!this.opened) {
      this.preOpenMessages.push(buffer);
    } else {
      await this.socket.send(buffer);
    }
  }

  async read(): Promise<Uint8Array | null> {
    return await this.queue.pop();
  }

  async close() {
    return await this.socket.close();
  }
}
