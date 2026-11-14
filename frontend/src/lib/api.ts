const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
const TOKEN_KEY = "headly_token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json")
  }
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && typeof window !== "undefined") {
    const onLogin = window.location.pathname.startsWith("/login")
    if (!onLogin) {
      setToken(null)
      window.location.href = "/login"
    }
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const data = await res.json()
      message = data.message || data.error || message
      if (Array.isArray(message)) message = message.join(", ")
    } catch {
      /* ignore */
    }
    throw new ApiError(message || "Request failed", res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ accessToken: string; user: import("./types").User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => api<import("./types").User>("/auth/me"),
}

export const dashboardApi = {
  stats: async () => {
    const raw = await api<{
      counts: {
        users: number
        pages: number
        posts: number
        sections: number
        websites?: number
      }
      activityOverTime: { date: string; count: number }[]
      leadsOverTime?: { date: string; count: number }[]
    }>("/dashboard/stats")
    return {
      totalUsers: raw.counts.users,
      totalPages: raw.counts.pages,
      totalPosts: raw.counts.posts,
      totalSections: raw.counts.sections,
      totalWebsites: raw.counts.websites ?? 0,
      activePages: raw.counts.pages,
      activePosts: raw.counts.posts,
      activitySeries: raw.activityOverTime,
      postDistribution: [
        { name: "Blog Posts", value: Math.max(1, Math.round(raw.counts.posts * 0.5)) },
        { name: "News", value: Math.max(0, Math.round(raw.counts.posts * 0.25)) },
        { name: "Campaigns", value: Math.max(0, raw.counts.posts - Math.round(raw.counts.posts * 0.75)) },
      ],
    } satisfies import("./types").DashboardStats
  },
}

export const usersApi = {
  list: () => api<import("./types").User[]>("/users"),
  create: (body: {
    name: string
    email: string
    password: string
    role: string
  }) =>
    api<import("./types").User>("/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<import("./types").User>) =>
    api<import("./types").User>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<void>(`/users/${id}`, { method: "DELETE" }),
}

export const websitesApi = {
  list: () => api<import("./types").Website[]>("/websites"),
  create: (body: {
    name: string
    slug: string
    url: string
    description?: string
  }) =>
    api<import("./types").Website>("/websites", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<import("./types").Website>) =>
    api<import("./types").Website>(`/websites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<void>(`/websites/${id}`, { method: "DELETE" }),
}

export const pagesApi = {
  list: (websiteId?: string) =>
    api<import("./types").Page[]>(
      websiteId ? `/pages?websiteId=${websiteId}` : "/pages",
    ),
  get: (id: string) => api<import("./types").Page>(`/pages/${id}`),
  create: (body: Record<string, unknown>) =>
    api<import("./types").Page>("/pages", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Record<string, unknown>) =>
    api<import("./types").Page>(`/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) => api<void>(`/pages/${id}`, { method: "DELETE" }),
}

export const sectionsApi = {
  list: () => api<import("./types").Section[]>("/sections"),
  create: (body: Record<string, unknown>) =>
    api<import("./types").Section>("/sections", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Record<string, unknown>) =>
    api<import("./types").Section>(`/sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) => api<void>(`/sections/${id}`, { method: "DELETE" }),
  pageSections: (pageId: string) =>
    api<import("./types").PageSection[]>(`/pages/${pageId}/sections`),
  attach: (pageId: string, sectionId: string) =>
    api<import("./types").PageSection>(`/pages/${pageId}/sections`, {
      method: "POST",
      body: JSON.stringify({ sectionId }),
    }),
  detach: (pageId: string, pageSectionId: string) =>
    api<void>(`/pages/${pageId}/sections/${pageSectionId}`, {
      method: "DELETE",
    }),
  reorder: (pageId: string, orderedIds: string[]) =>
    api<import("./types").PageSection[]>(`/pages/${pageId}/sections/reorder`, {
      method: "POST",
      body: JSON.stringify({
        items: orderedIds.map((pageSectionId, order) => ({
          pageSectionId,
          order,
        })),
      }),
    }),
  updatePageSection: (
    pageId: string,
    pageSectionId: string,
    body: Record<string, unknown>,
  ) =>
    api<import("./types").PageSection>(
      `/pages/${pageId}/sections/${pageSectionId}`,
      { method: "PATCH", body: JSON.stringify(body) },
    ),
}

export const postsApi = {
  list: () => api<import("./types").Post[]>("/posts"),
  create: (body: Record<string, unknown>) =>
    api<import("./types").Post>("/posts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Record<string, unknown>) =>
    api<import("./types").Post>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) => api<void>(`/posts/${id}`, { method: "DELETE" }),
}

export const categoriesApi = {
  list: () => api<import("./types").Category[]>("/categories"),
  create: (body: { name: string; slug: string }) =>
    api<import("./types").Category>("/categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<import("./types").Category>) =>
    api<import("./types").Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    api<void>(`/categories/${id}`, { method: "DELETE" }),
}

export const seoApi = {
  list: () => api<import("./types").SeoSetting[]>("/seo"),
  upsert: (body: Record<string, unknown>) =>
    api<import("./types").SeoSetting>("/seo", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id: string) => api<void>(`/seo/${id}`, { method: "DELETE" }),
}

export const activityApi = {
  list: (userId?: string) =>
    api<import("./types").ActivityLog[]>(
      userId ? `/activity-logs?userId=${userId}` : "/activity-logs",
    ),
}
