/**
 * Parse Refine's simple-rest query params into Prisma query options.
 * Supports: _start, _end, _sort, _order, q (search)
 */
const parseRefineParams = (query, searchFields = []) => {
  const { _start, _end, _sort, _order, q, ...filters } = query;

  const prismaQuery = {};

  // Pagination
  if (_start !== undefined && _end !== undefined) {
    prismaQuery.skip = parseInt(_start);
    prismaQuery.take = parseInt(_end) - parseInt(_start);
  }

  // Sorting
  if (_sort && _order) {
    prismaQuery.orderBy = { [_sort]: _order.toLowerCase() };
  } else {
    prismaQuery.orderBy = { createdAt: "desc" };
  }

  // Search
  if (q && searchFields.length > 0) {
    prismaQuery.where = {
      ...prismaQuery.where,
      OR: searchFields.map((field) => ({
        [field]: { contains: q, mode: "insensitive" },
      })),
    };
  }

  // Additional filters (e.g., status=PUBLISHED, authorId=1)
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      if (!prismaQuery.where) prismaQuery.where = {};
      // Try to parse as number for ID fields
      prismaQuery.where[key] = isNaN(value) ? value : parseInt(value);
    }
  }

  return prismaQuery;
};

module.exports = { parseRefineParams };
