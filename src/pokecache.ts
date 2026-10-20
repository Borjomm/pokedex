
type CacheEntry<T> = {
    createdAt: number;
    val: T
};

export class Cache {
    #cache = new Map<string, CacheEntry<any>>();
    #reapIntervalId: NodeJS.Timeout | undefined = undefined;
    #interval: number;

    constructor(interval: number) {
        this.#interval = interval;
        // console.log(`Cache set with cleanup interval of ${interval} ms`);
        this.#startReapLoop();
    }

    #reap() {
        for (const [key, val] of this.#cache.entries()) {
            if (val.createdAt < Date.now() - this.#interval) {
                this.#cache.delete(key);
            }
        }
    }

    #startReapLoop() {
        this.#reapIntervalId = setInterval(() => this.#reap(), this.#interval);
    }

    stopReadLoop() {
        clearInterval(this.#reapIntervalId);
        this.#reapIntervalId = undefined;
    }

    add<T>(key: string, val: T) {
        this.#cache.set(key, {createdAt: Date.now(), val});
    }

    get<T>(key: string): T | undefined {
        return this.#cache.get(key)?.val as T;
    }
}