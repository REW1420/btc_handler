export async function monitor_loop<T>(
  source: () => T[],
  callback: (item: T) => Promise<"keep" | "remove" | "stop">,
  delay_ms = 3000
): Promise<void> {
  while (true) {
    const items = source();

    if (items.length === 0) {
      await new Promise((r) => setTimeout(r, delay_ms));
      continue;
    }

    const items_copy = [...items];

    for (const item of items_copy) {
      const action = await callback(item);

      if (action === "stop") {
        console.log("Loop detenido por callback");
        return;
      }

      if (action === "remove") {
        const index = items.indexOf(item);
        if (index !== -1) items.splice(index, 1);
      }
    }

    await new Promise((r) => setTimeout(r, delay_ms));
  }
}
