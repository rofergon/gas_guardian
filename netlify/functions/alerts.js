import { getDbClient } from './_lib/db.js';
import { badRequest, json, ok, serverError } from './_lib/response.js';

function mapAlert(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    enabled: Boolean(row.enabled),
    threshold: Number(row.threshold),
    type: row.type,
    createdAt: String(row.created_at),
    lastTriggered: row.last_triggered ? String(row.last_triggered) : undefined,
  };
}

function parseBody(event) {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

export const handler = async (event) => {
  try {
    const db = getDbClient();

    if (event.httpMethod === 'GET') {
      const result = await db.execute('SELECT * FROM gas_alerts ORDER BY created_at DESC');
      return ok({ alerts: result.rows.map(mapAlert) });
    }

    if (event.httpMethod === 'POST') {
      const body = parseBody(event);
      if (!body.name || typeof body.threshold !== 'number' || !body.type) {
        return badRequest('name, threshold and type are required');
      }

      const result = await db.execute({
        sql: `
          INSERT INTO gas_alerts (name, threshold, type, enabled)
          VALUES (?, ?, ?, ?)
          RETURNING *
        `,
        args: [body.name, body.threshold, body.type, body.enabled ? 1 : 0],
      });

      return json(201, { alert: mapAlert(result.rows[0]) });
    }

    if (event.httpMethod === 'PATCH') {
      const body = parseBody(event);
      if (!body.id || typeof body.enabled !== 'boolean') {
        return badRequest('id and enabled are required');
      }

      await db.execute({
        sql: 'UPDATE gas_alerts SET enabled = ? WHERE id = ?',
        args: [body.enabled ? 1 : 0, body.id],
      });

      return ok({ success: true });
    }

    if (event.httpMethod === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) {
        return badRequest('id is required');
      }

      await db.execute({
        sql: 'DELETE FROM gas_alerts WHERE id = ?',
        args: [id],
      });

      return ok({ success: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    return serverError(error);
  }
};
