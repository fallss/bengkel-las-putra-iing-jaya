import { cookies } from 'next/headers';
import db from '@/lib/db';

/**
 * Verify whether the incoming request carries a valid admin_session cookie
 * matching an existing row in the admin_users table.
 */
export function isAdminAuthenticated(): boolean {
  const session = cookies().get('admin_session');
  if (!session?.value) return false;
  try {
    const parsed = JSON.parse(session.value);
    if (!parsed || !parsed.id || !parsed.username) return false;
    const row = db
      .prepare('SELECT id FROM admin_users WHERE id = ? AND username = ?')
      .get(parsed.id, parsed.username);
    return Boolean(row);
  } catch {
    return false;
  }
}

