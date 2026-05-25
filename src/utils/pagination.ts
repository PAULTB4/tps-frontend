export function extractRows<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const obj = payload as Record<string, unknown>;
  return (Array.isArray(obj.data) ? obj.data : Array.isArray(obj.items) ? obj.items : []) as T[];
}

export function extractMeta(payload: unknown): { total: number; page: number; limit: number; totalPages: number } | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const obj = payload as Record<string, unknown>;

  if (obj.meta && typeof obj.meta === 'object') {
    const m = obj.meta as Record<string, unknown>;
    return {
      total: Number(m.total ?? 0),
      page: Number(m.page ?? 1),
      limit: Number(m.limit ?? 20),
      totalPages: Number(m.totalPages ?? 1),
    };
  }

  const total = Number(obj.total ?? 0);
  const page = Number(obj.page ?? 1);
  const limit = Number(obj.limit ?? 20);
  if (total > 0 || page > 1) {
    return {
      total,
      page,
      limit,
      totalPages: Number(obj.totalPages ?? (Math.ceil(total / limit) || 1)),
    };
  }

  return undefined;
}

export function cleanParams(params?: Record<string, string | number | undefined>): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}
