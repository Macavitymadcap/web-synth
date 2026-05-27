const port = process.env.A11Y_PORT ?? "4174";
const url = `http://127.0.0.1:${port}`;

const server = Bun.spawn(
  ["bun", "run", "dev", "--", "--host", "127.0.0.1", "--port", port, "--strictPort"],
  {
    stdout: "pipe",
    stderr: "pipe",
  }
);

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await Bun.sleep(250);
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
}

try {
  await waitForServer();

  const pa11y = Bun.spawn(
    [
      "bunx",
      "pa11y",
      url,
      "--standard",
      "WCAG2AA",
      "--wait",
      "1000",
      "--timeout",
      "30000",
    ],
    {
      stdout: "inherit",
      stderr: "inherit",
    }
  );

  const exitCode = await pa11y.exited;
  process.exitCode = exitCode;
} finally {
  server.kill();
  await server.exited.catch(() => {});
}
