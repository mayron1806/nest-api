import { query, tableValues } from "../helpers/mysql";
import { Event } from "../interfaces/tables/events";
import { Locals } from "../interfaces/general";
import { deleteItemFromCache, cachedQuery } from "../helpers/cache";
import { CacheCategories } from "../interfaces/enum";

/*
 * Create a new security event
 */
export const createEvent = async (event: Event, locals?: Locals) => {
  if (typeof event.data === "object") event.data = JSON.stringify(event.data);
  event.createdAt = new Date();
  if (locals) {
    event.ipAddress = locals.ipAddress;
    event.userAgent = locals.userAgent;
  }
  if (event.userId) {
    deleteItemFromCache(CacheCategories.USER_EVENT, event.userId);
    deleteItemFromCache(CacheCategories.USER_RECENT_EVENTS, event.userId);
  }
  await query(`INSERT INTO events ${tableValues(event)}`, Object.values(event));
};

/*
 * Get all security events for a user
 */
export const getUserEvents = async (userId: number) => {
  return <Event[]>(
    await cachedQuery(
      CacheCategories.USER_EVENT,
      userId,
      `SELECT * FROM events WHERE userId = ?`,
      [userId]
    )
  );
};

/*
 * Get the 10 most recent security events for a user
 */
export const getUserRecentEvents = async (userId: number) => {
  return <Event[]>(
    await cachedQuery(
      CacheCategories.USER_RECENT_EVENTS,
      userId,
      `SELECT * FROM events WHERE userId = ? ORDER BY id DESC LIMIT 10`,
      [userId]
    )
  );
};
