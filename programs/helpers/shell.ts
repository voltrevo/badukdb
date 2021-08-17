// deno-lint-ignore-file no-namespace

// This is free and unencumbered software released into the public domain.
//
// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.
//
// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//
// For more information, please refer to <http://unlicense.org/>

namespace shell {
  export async function run(...cmd: string[]): Promise<void> {
    const process = Deno.run({ cmd, stdout: "inherit", stderr: "inherit" });

    const unloadListener = () => {
      console.log("Sending SIGINT to", cmd);
      process.kill(Deno.Signal.SIGINT);
    };

    globalThis.addEventListener("unload", unloadListener);

    const status = await process.status();

    globalThis.removeEventListener("unload", unloadListener);

    if (!status.success) {
      throw new Error(
        `Command: "${cmd.join(" ")}" exited with code ${status.code}`,
      );
    }
  }

  export async function String(...cmd: string[]): Promise<string> {
    const process = Deno.run({ cmd, stdout: "piped" });

    if (process.stdout === null) {
      throw new Error("I don't know why this would happen");
    }

    let text = new TextDecoder().decode(await process.output());
    const status = await process.status();

    if (!status.success) {
      throw new Error(`Command failed: ${cmd.join(" ")}`);
    }

    return text;
  }

  export async function Lines(...cmd: string[]): Promise<string[]> {
    let text = await String(...cmd);

    // Ignore trailing newline
    if (text[text.length - 1] === "\n") {
      text = text.slice(0, -1);
    }

    return text.split("\n");
  }

  export async function Line(...cmd: string[]): Promise<string> {
    const lines = await Lines(...cmd);

    if (lines.length !== 1) {
      throw new Error("Expected exactly one line");
    }

    return lines[0];
  }
}

export default shell;
