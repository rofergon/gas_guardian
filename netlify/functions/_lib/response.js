export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

export function ok(body) {
  return json(200, body);
}

export function badRequest(message) {
  return json(400, { error: message });
}

export function serverError(error) {
  const message = error instanceof Error ? error.message : 'Internal server error';
  return json(500, { error: message });
}
