/**
 * Parse Refine query params into Prisma query options.
 *
 * Supports two pagination conventions:
 *   • _page / _limit  (custom dataProvider used in this project)
 *   • _start / _end   (Refine simple-rest style)
 *
 * Also handles: _sort, _order, q (full-text search), and arbitrary field filters.
 */
const parseRefineParams = (query, searchFields = []) => {
  const { _start, _end, _page, _limit, _sort, _order, q, ...filters } = query;

  const prismaQuery = {};

  // ── Pagination ──────────────────────────────────────────────────────────────
  if (_page !== undefined || _limit !== undefined) {
    // Page-based: ?_page=1&_limit=10
    const page  = Math.max(1, parseInt(_page)  || 1);
    const limit = Math.min(100, parseInt(_limit) || 10);
    prismaQuery.skip = (page - 1) * limit;
    prismaQuery.take = limit;
  } else if (_start !== undefined && _end !== undefined) {
    // Range-based: ?_start=0&_end=10
    prismaQuery.skip = parseInt(_start);
    prismaQuery.take = parseInt(_end) - parseInt(_start);
  }

  // ── Sorting ─────────────────────────────────────────────────────────────────
  if (_sort && _order) {
    prismaQuery.orderBy = { [_sort]: _order.toLowerCase() };
  } else {
    prismaQuery.orderBy = { createdAt: "desc" };
  }

  // ── Full-text search ────────────────────────────────────────────────────────
  if (q && searchFields.length > 0) {
    prismaQuery.where = {
      ...prismaQuery.where,
      OR: searchFields.map((field) => ({
        [field]: { contains: q, mode: "insensitive" },
      })),
    };
  }

  // ── Field filters ───────────────────────────────────────────────────────────
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    if (!prismaQuery.where) prismaQuery.where = {};
    // Coerce to number only for obvious ID/count fields to avoid breaking string enums
    const isId = key.endsWith("Id") || key === "id";
    prismaQuery.where[key] = (isId && !isNaN(value)) ? parseInt(value) : value;
  }

  return prismaQuery;
};

module.exports = { parseRefineParams };
