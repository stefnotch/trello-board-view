export function useLocalCache() {
  const localCacheName = "local-cache/";

  function setCacheValue<T>(
    key: string,
    value: T,
    expiryDate: Date | null = null
  ) {
    localStorage[localCacheName + key] = JSON.stringify({
      value: value,
      expiryDate: expiryDate,
    });
  }

  function getCacheValue<T>(key: string): T | undefined {
    let stringValue = localStorage[localCacheName + key];
    if (!stringValue) return undefined;

    let value = JSON.parse(stringValue);
    if (value.expiryDate && (value.expiryDate as Date).getTime() > Date.now()) {
      return undefined;
    }

    return value.value as T;
  }

  return {
    setCacheValue,
    getCacheValue,
  };
}
