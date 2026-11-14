export type Role = "ADMIN" | "EDITOR" | "VIEWER"
export type PageStatus = "ACTIVE" | "INACTIVE"
export type PostStatus = "ACTIVE" | "INACTIVE" | "DRAFT"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  isActive: boolean
  createdAt?: string
}

export interface Website {
  id: string
  name: string
  slug: string
  url: string
  description?: string | null
}

export interface Page {
  id: string
  name: string
  slug: string
  status: PageStatus
  websiteId: string
  parentId?: string | null
  parent?: Page | null
  createdAt?: string
}

export interface Section {
  id: string
  name: string
  type: string
  content: Record<string, unknown>
  description?: string | null
}

export interface PageSection {
  id: string
  pageId: string
  sectionId: string
  order: number
  contentOverride?: Record<string, unknown> | null
  section?: Section
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  status: PostStatus
  categoryId?: string | null
  category?: Category | null
  excerpt?: string | null
}

export interface SeoSetting {
  id: string
  entityType: "SITE" | "PAGE" | "POST"
  entityId: string
  title: string
  description?: string | null
  keywords?: string | null
  ogImage?: string | null
}

export interface ActivityLog {
  id: string
  userId?: string | null
  user?: User | null
  entity: string
  entityId?: string | null
  action: string
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export interface DashboardStats {
  totalUsers: number
  totalPages: number
  totalPosts: number
  totalSections: number
  totalWebsites?: number
  activePages?: number
  activePosts?: number
  postDistribution?: { name: string; value: number }[]
  activitySeries?: { date: string; count: number }[]
}
