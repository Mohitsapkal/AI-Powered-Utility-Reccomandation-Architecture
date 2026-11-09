'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Reply, Edit3, Trash2, Send, CornerDownRight } from 'lucide-react';
import { Comment } from '@/types';
import { cralyApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface CommentThreadProps {
  postId: string;
}

export default function CommentThread({ postId }: CommentThreadProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newContent, setNewContent] = useState('');
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load comments
  const loadComments = async () => {
    setIsLoading(true);
    const data = await cralyApi.getComments(postId);
    if (data.length > 0) {
      setComments(data);
    } else {
      // Default starter comments for rich community feel
      const seedComments: Comment[] = [
        {
          id: 'c_1',
          postId,
          user: {
            id: 'u_1',
            displayName: 'Sarah Lin',
            photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          },
          content: 'Tested this prompt with `--style raw` on v6.1 and the skin texture resolution is breathtaking. Great share!',
          likes: 24,
          likedBy: [],
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          replies: [
            {
              id: 'c_1_1',
              postId,
              parentCommentId: 'c_1',
              user: {
                id: 'u_2',
                displayName: 'Marcus Dev',
                photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
              },
              content: 'What aspect ratio did you use? 16:9 or vertical 9:16?',
              likes: 6,
              likedBy: [],
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              updatedAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
        },
      ];
      setComments(seedComments);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  // Submit new top-level comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const optimistic: Comment = {
      id: 'c_' + Date.now(),
      postId,
      user: {
        id: user?.id || 'guest',
        displayName: user?.displayName || 'Anonymous Explorer',
        photoUrl: user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      content: newContent.trim(),
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments([optimistic, ...comments]);
    setNewContent('');
    showToast('Comment published!');

    await cralyApi.addComment({ postId, content: optimistic.content });
  };

  // Submit reply
  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: Comment = {
      id: 'r_' + Date.now(),
      postId,
      parentCommentId: parentId,
      user: {
        id: user?.id || 'guest',
        displayName: user?.displayName || 'Anonymous Explorer',
        photoUrl: user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      },
      content: replyContent.trim(),
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId || c._id === parentId) {
          return { ...c, replies: [...(c.replies || []), newReply] };
        }
        return c;
      })
    );

    setReplyParentId(null);
    setReplyContent('');
    showToast('Reply added!');

    await cralyApi.addComment({ postId, content: newReply.content, parentCommentId: parentId });
  };

  // Like comment
  const handleToggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId || c._id === commentId) {
          const isLiked = c.isLiked;
          return {
            ...c,
            isLiked: !isLiked,
            likes: (c.likes || 0) + (isLiked ? -1 : 1),
          };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === commentId || r._id === commentId) {
                const isLiked = r.isLiked;
                return {
                  ...r,
                  isLiked: !isLiked,
                  likes: (r.likes || 0) + (isLiked ? -1 : 1),
                };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
    cralyApi.likeComment(commentId);
  };

  // Edit comment
  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId || c._id === commentId) {
          return { ...c, content: editContent, isEdited: true };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId || r._id === commentId ? { ...r, content: editContent, isEdited: true } : r
            ),
          };
        }
        return c;
      })
    );
    setEditingId(null);
    setEditContent('');
    showToast('Comment updated');
    await cralyApi.updateComment(commentId, editContent);
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId && c._id !== commentId));
    showToast('Comment removed');
    await cralyApi.deleteComment(commentId);
  };

  return (
    <div id="comments" style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <MessageSquare size={20} color="var(--accent-blue)" />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#FFFFFF' }}>
          Discussion & Replies ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Add New Comment Box */}
      <form onSubmit={handleAddComment} style={{ marginBottom: '36px' }}>
        <div
          style={{
            display: 'flex',
            gap: '14px',
            backgroundColor: '#121524',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <img
            src={user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt="My Avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              rows={3}
              placeholder="Share your thoughts, test results, or prompt variations..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={!newContent.trim()}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <Send size={14} /> Post Comment
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {comments.map((comment) => {
          const cId = comment.id || comment._id || '';
          const author = comment.user || comment.userId || { displayName: 'Creator' };

          return (
            <div
              key={cId}
              style={{
                backgroundColor: '#151928',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '18px',
              }}
            >
              {/* Comment Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={author.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={author.displayName}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF', marginRight: '8px' }}>
                      {author.displayName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                      {comment.isEdited && ' • Edited'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setEditingId(cId);
                      setEditContent(comment.content);
                    }}
                    style={{ color: 'var(--text-muted)', padding: '4px' }}
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(cId)}
                    style={{ color: 'var(--text-muted)', padding: '4px' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Comment Body or Edit Mode */}
              {editingId === cId ? (
                <div style={{ marginBottom: '12px' }}>
                  <textarea
                    rows={2}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0D0F18',
                      border: '1px solid var(--accent-blue)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => handleSaveEdit(cId)}
                      className="btn btn-primary"
                      style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '14px' }}>
                  {comment.content}
                </p>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => handleToggleLike(cId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    color: comment.isLiked ? '#EF4444' : 'var(--text-muted)',
                  }}
                >
                  <Heart size={14} fill={comment.isLiked ? '#EF4444' : 'none'} />
                  <span>{comment.likes || 0}</span>
                </button>

                <button
                  onClick={() => {
                    setReplyParentId(replyParentId === cId ? null : cId);
                    setReplyContent('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Reply size={14} />
                  <span>Reply</span>
                </button>
              </div>

              {/* Reply Form */}
              {replyParentId === cId && (
                <div style={{ marginTop: '14px', paddingLeft: '20px', borderLeft: '2px solid rgba(74, 144, 226, 0.4)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder={`Reply to ${author.displayName}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      style={{
                        flex: 1,
                        background: '#0E111C',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddReply(cId);
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(cId)}
                      className="btn btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Child Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginTop: '16px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {comment.replies.map((reply) => {
                    const rId = reply.id || reply._id || '';
                    const rAuthor = reply.user || reply.userId || { displayName: 'Contributor' };
                    return (
                      <div
                        key={rId}
                        style={{
                          backgroundColor: '#111422',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          padding: '12px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <CornerDownRight size={13} color="var(--accent-blue)" />
                          <img
                            src={rAuthor.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                            alt={rAuthor.displayName}
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#FFFFFF' }}>{rAuthor.displayName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, paddingLeft: '21px' }}>
                          {reply.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
