export function getKey(userId: string, assignmentId: string) {
  return `sandbox:${userId}:${assignmentId}`;
}

export function getSchema(userId: string, assignmentId: string) {
  return `workspace_${userId}_${assignmentId}`;
}

export async function slidingLimiter(redis: any, key: string, limit: number, window: number) {
  const slidingWindowLua = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local limit = tonumber(ARGV[3])

  local windowStart = now - window

  -- remove expired
  redis.call("ZREMRANGEBYSCORE", key, 0, windowStart)

  -- count current
  local current = redis.call("ZCARD", key)

  if current >= limit then
    return 0
  end

  -- add new request
  redis.call("ZADD", key, now, now)

  -- set expiry
  redis.call("EXPIRE", key, math.ceil(window / 1000))

  return 1
  `;

  const now = Date.now();

  const allowed = await redis.eval(
    slidingWindowLua,
    {
      keys: [key],
      arguments: [
        now.toString(),
        window.toString(),
        limit.toString()
      ]
    }
  );

  return allowed === 1;
}