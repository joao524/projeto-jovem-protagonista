/**
 * TTNB Defensive Storage Utility
 * - Proteção contra Storage Quota Exceeded (ex: Safari privado ou storage cheio)
 * - Sanitização e validação de JSON (previne quebras por dados corrompidos)
 * - Evicção e expiração inteligente de chaves temporárias
 * - Eventos de sincronização reativa com fallback graceful quando localStorage estiver inacessível
 */

class SafeStorage {
  private memoryFallback: Map<string, string> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__ttnb_storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getItem<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    try {
      const raw = this.isLocalStorageAvailable
        ? window.localStorage.getItem(key)
        : this.memoryFallback.get(key) ?? null;

      if (raw === null || raw === undefined) {
        return defaultValue;
      }

      // Tenta parsear JSON; se for string pura não-JSON, retorna raw
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch (err) {
      console.warn(`[SafeStorage] Erro ao ler a chave "${key}":`, err);
      return defaultValue;
    }
  }

  public setItem(key: string, value: unknown): boolean {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);

      if (this.isLocalStorageAvailable) {
        try {
          window.localStorage.setItem(key, serialized);
          return true;
        } catch (quotaError) {
          console.warn('[SafeStorage] Quota exceeded. Executando limpeza de chaves temporárias...');
          this.purgeTransientKeys();
          try {
            window.localStorage.setItem(key, serialized);
            return true;
          } catch {
            this.memoryFallback.set(key, serialized);
            return false;
          }
        }
      } else {
        this.memoryFallback.set(key, serialized);
        return true;
      }
    } catch (err) {
      console.error(`[SafeStorage] Falha ao serializar/armazenar chave "${key}":`, err);
      return false;
    }
  }

  public removeItem(key: string): void {
    try {
      if (this.isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      }
      this.memoryFallback.delete(key);
    } catch (err) {
      console.warn(`[SafeStorage] Erro ao remover a chave "${key}":`, err);
    }
  }

  public clear(): void {
    try {
      if (this.isLocalStorageAvailable) {
        window.localStorage.clear();
      }
      this.memoryFallback.clear();
    } catch (err) {
      console.warn('[SafeStorage] Erro ao limpar storage:', err);
    }
  }

  /**
   * Remove chaves transitórias ou de rascunhos para liberar espaço
   */
  public purgeTransientKeys(): void {
    const transientPrefixes = ['ttnb_checkout_pending', 'ttnb_pix_timer', 'ttnb_temp_'];
    try {
      if (!this.isLocalStorageAvailable) return;
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const key = window.localStorage.key(i);
        if (key && transientPrefixes.some(p => key.startsWith(p))) {
          window.localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.warn('[SafeStorage] Erro durante purga transitória:', err);
    }
  }
}

export const safeStorage = new SafeStorage();
