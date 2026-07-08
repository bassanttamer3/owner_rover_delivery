export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  status: 'read' | 'unread';
  priority?: 'high' | 'low';
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}