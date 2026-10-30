import { ObjectId, type Sort } from "mongodb";
import { z } from "zod";
import { notFound } from "./errors.js";

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const MAX_PAGE_SIZE = 100;

/**
 * ?page=&pageSize=&q=&sort= where sort is a whitelisted field, optionally
 * prefixed with "-" for descending order.
 */
export function paginationSchema<const F extends string>(sortFields: readonly [F, ...F[]], defaultSort: string) {
  const sortValues = sortFields.flatMap((field) => [field, `-${field}`]) as [string, ...string[]];
  return z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
    q: z.string().trim().max(100).optional(),
    sort: z.enum(sortValues).default(defaultSort)
  });
}

export function toMongoSort(sort: string): Sort {
  return sort.startsWith("-") ? { [sort.slice(1)]: -1, _id: -1 } : { [sort]: 1, _id: 1 };
}

/** Case-insensitive "contains" with the user input treated literally. */
export function containsRegex(q: string): RegExp {
  return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

/** Parses a route :id; malformed ids are reported as not found. */
export function parseObjectId(value: unknown): ObjectId {
  if (typeof value !== "string" || !ObjectId.isValid(value) || value.length !== 24) {
    throw notFound();
  }
  return new ObjectId(value);
}
