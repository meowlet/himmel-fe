export class Util {
  static buildQueryString(
    params: Record<
      string,
      string | number | boolean | (string | number | boolean)[]
    >
  ): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
        }
      } else if (value !== null && value !== undefined) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }

    return parts.join("&");
  }
}
