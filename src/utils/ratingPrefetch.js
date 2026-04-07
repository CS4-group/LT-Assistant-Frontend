export const ENTITY_TYPE_MAP = { courses: 'course', clubs: 'club', teachers: 'teacher' }
export const DETAILS_PREFIX = { courses: '/api/courses/', clubs: '/api/clubs/', teachers: '/api/teachers/' }

export function buildDetailsUrl(tab, id) {
  return `${DETAILS_PREFIX[tab]}${id}`
}

export function buildReviewsUrl(tab, id) {
  return `/api/reviews?entityType=${ENTITY_TYPE_MAP[tab]}&entityId=${id}`
}

export function prefetchFirstItem(tab, items, getFn) {
  if (!Array.isArray(items) || !items.length) return
  const id = items[0].id
  getFn(buildDetailsUrl(tab, id)).catch(() => {})
  getFn(buildReviewsUrl(tab, id)).catch(() => {})
}
