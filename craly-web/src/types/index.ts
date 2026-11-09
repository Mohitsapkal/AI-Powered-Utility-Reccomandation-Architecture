export interface Tool {
  id: string;
  _id?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  longDescription?: string;
  logoUrl?: string;
  logo?: string;
  url?: string;
  websiteUrl?: string;
  category?: string;
  tags: string[];
  isTrending?: boolean;
  likesCount?: number;
  popularity?: number;
  pricing?: string;
  pricingModel?: string;
  features?: Record<string, any>;
  useCases?: string[];
  order?: number;
  isLiked?: boolean;
}

export interface WorkflowStep {
  title: string;
  description: string;
  toolId?: Tool | string;
  prompt?: string;
}

export interface Workflow {
  id: string;
  _id?: string;
  name: string;
  description: string;
  iconName: string;
  duration: string;
  steps: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  order?: number;
  likesCount?: number;
  isLiked?: boolean;
  journey: WorkflowStep[];
}

export interface MediaModel {
  type: 'image' | 'video' | string;
  url: string;
  thumbnailUrl?: string;
}

export interface PromptModel {
  content: string;
  toolId?: string;
  copyEnabled?: boolean;
  difficulty?: string;
  estimatedTime?: string;
  usedCount?: number;
}

export interface Post {
  id: string;
  _id?: string;
  postType: 'prompt' | 'tool' | 'workflow' | 'article' | 'video' | string;
  title: string;
  body: string;
  media?: MediaModel;
  prompt?: PromptModel;
  tool?: Tool;
  category?: Category;
  tags: string[];
  likes: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isTrending?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  isLiked?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommentUser {
  id: string;
  _id?: string;
  displayName: string;
  photoUrl?: string;
}

export interface Comment {
  id: string;
  _id?: string;
  postId: string;
  user: CommentUser;
  userId?: CommentUser;
  content: string;
  parentCommentId?: string | null;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
  isEdited?: boolean;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface Category {
  id: string;
  _id?: string;
  name: string;
  icon?: string;
  iconName?: string;
  description?: string;
  toolCount?: number;
  toolsCount?: number;
  tools?: Tool[];
}

export interface Banner {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  buttonText?: string;
  badge?: string;
}

export interface Promotion {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  ctaText?: string;
  sponsoredBy?: string;
}

export interface HomeData {
  banners: Banner[];
  promotions: Promotion[];
  trendingTools: Tool[];
  topTools: Tool[];
  topWorkflows: Workflow[];
  topCategories: Category[];
  personalized?: {
    tools: Tool[];
    workflows: Workflow[];
  };
}

export interface UserProfile {
  id: string;
  _id?: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  bio?: string;
  interests?: string[];
  heardFrom?: string;
  likedPosts?: string[];
  followedWorkflows?: string[];
  savedTools?: string[];
  activityHistory?: any[];
  isNewUser?: boolean;
  createdAt?: string;
}

export interface SearchResults {
  tools: Tool[];
  categories: Category[];
  workflows: Workflow[];
  posts: Post[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  mediaUrl?: string;
  mediaType?: string;
  base64Data?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string | number;
  updatedAt: string | number;
  messagePreview?: string;
  messages?: ChatMessage[];
}

export type GenUiType =
  | 'tool-recommendation'
  | 'compare'
  | 'workflow'
  | 'action-chips'
  | 'interactive-filter'
  | 'code-snippet';

export interface GenUiToolItem {
  id: string;
  name: string;
  tagline?: string;
  category?: string;
  pricing?: string;
  rating?: number;
  websiteUrl?: string;
  features?: string[];
}

export interface GenUiCompareItem {
  name: string;
  pricing: string;
  category: string;
  bestFor: string;
  pros?: string[];
  cons?: string[];
}

export interface GenUiWorkflowStep {
  step: number;
  title: string;
  tool: string;
  duration?: string;
  description?: string;
}

export interface AvatarOption {
  id: string;
  _id?: string;
  name: string;
  url: string;
}

export interface AppUpdateInfo {
  latestVersion: string;
  minSupportedVersion: string;
  forceUpdate: boolean;
  updateUrl: string;
  releaseNotes: string;
}
