import { monitor_loop } from "../workerLoop";

type MonitorCallback<T> = (item: T) => Promise<"keep" | "remove" | "stop">;

export function create_pool_watcher<T>(
  callback: MonitorCallback<T>,
  delay_ms = 3000
) {
  const pool: T[] = [];

  function add(item: T) {
    pool.push(item);
  }

  function get_pool() {
    return [...pool];
  }

  async function start() {
    await monitor_loop(() => pool, callback, delay_ms);
  }

  return {
    add,
    get_pool,
    start,
  };
}
