'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Heart,
  Layers,
  Wrench,
  MessageSquare,
  Edit3,
  Sparkles,
  Check,
  X,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cralyApi } from '@/services/api';
import { Tool, Workflow, Post, Comment, AvatarOption } from '@/types';
import ToolCard from '@/components/ToolCard';
import WorkflowCard from '@/components/WorkflowCard';
import PostCard from '@/components/PostCard';

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'tools' | 'workflows' | 'posts' | 'comments'>('tools');
  const [likedTools, setLikedTools] = useState<Tool[]>([]);
  const [likedWorkflows, setLikedWorkflows] = useState<Workflow[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoUrl || '');

  useEffect(() => {
    async function loadActivity() {
      const [backendTools, backendWorkflows, backendPosts, comments, avs] = await Promise.all([
        cralyApi.getLikedTools(),
        cralyApi.getLikedWorkflows(),
        cralyApi.getLikedPosts(),
        cralyApi.getUserComments(),
        cralyApi.getAvatars(),
      ]);

      const savedToolIds = user?.savedTools || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('craly_guest_saved_tools') || '[]') : []);
      const savedWfIds = user?.followedWorkflows || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('craly_guest_followed_workflows') || '[]') : []);
      const savedPostIds = user?.likedPosts || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('craly_guest_liked_posts') || '[]') : []);

      // If backend liked list is empty but user has saved IDs locally, resolve them against actual database tools
      if (backendTools.length > 0) {
        setLikedTools(backendTools);
      } else if (savedToolIds.length > 0) {
        const allDbTools = await cralyApi.getTools({ limit: 100 });
        setLikedTools(allDbTools.filter((t: Tool) => savedToolIds.includes(t.id || t._id || '')));
      } else {
        setLikedTools([]);
      }

      if (backendWorkflows.length > 0) {
        setLikedWorkflows(backendWorkflows);
      } else if (savedWfIds.length > 0) {
        const allDbWfs = await cralyApi.getWorkflows(1, 50);
        setLikedWorkflows(allDbWfs.filter((w: Workflow) => savedWfIds.includes(w.id || w._id || '')));
      } else {
        setLikedWorkflows([]);
      }

      if (backendPosts.length > 0) {
        setLikedPosts(backendPosts);
      } else if (savedPostIds.length > 0) {
        const allDbPosts = await cralyApi.getPosts(1, 50);
        setLikedPosts(allDbPosts.filter((p: Post) => savedPostIds.includes(p.id || p._id || '')));
      } else {
        setLikedPosts([]);
      }

      setUserComments(comments);
      setAvatars(avs);
    }
    loadActivity();
  }, [user]);

  const handleSaveProfile = async () => {
    await updateProfile({
      displayName: editName,
      bio: editBio,
      photoUrl: editPhoto,
    });
    setIsEditing(false);
    showToast('Profile updated successfully!');
  };

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Profile Overview Card */}
      <div
        className="glass-card"
        style={{
          padding: '40px',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(22, 26, 41, 0.95) 0%, rgba(14, 17, 26, 0.95) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <img
              src={user?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.displayName || 'User'}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(74, 144, 226, 0.4)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {user?.displayName || 'Creator'}
                </h1>
                <span className="badge badge-brand">AI BUILDER</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                {user?.email}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.6 }}>
                {user?.bio || 'Exploring generative AI, prompt engineering, and autonomous creative pipelines.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setEditName(user?.displayName || '');
                setEditBio(user?.bio || '');
                setEditPhoto(user?.photoUrl || '');
                setIsEditing(true);
              }}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Edit3 size={15} /> Edit Profile
            </button>
            <Link href="/onboarding" className="btn btn-accent" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Sparkles size={15} /> Manage Interests
            </Link>
            <button
              onClick={async () => {
                await logout();
                showToast('You have been signed out. All local data cleared.', 'info');
                router.push('/');
              }}
              className="btn btn-outline"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                color: '#F87171',
                borderColor: 'rgba(239, 68, 68, 0.45)',
              }}
              title="Sign Out & Clear All Local Data"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Interests Pills */}
        {user?.interests && user.interests.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '12px' }}>
              My AI Focus Areas:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {user.interests.map((interest) => (
                <span key={interest} className="badge badge-brand">
                  #{interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
          }}
        >
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{likedTools.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saved Tools</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{likedWorkflows.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Workflows</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F472B6' }}>{likedPosts.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upvoted Posts</div>
          </div>
          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{userComments.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comments</div>
          </div>
        </div>
      </div>

      {/* Activity Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '32px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'tools', label: `Saved Tools (${likedTools.length})`, icon: Wrench },
          { key: 'workflows', label: `Followed Workflows (${likedWorkflows.length})`, icon: Layers },
          { key: 'posts', label: `Upvoted Prompts (${likedPosts.length})`, icon: Heart },
          { key: 'comments', label: `My Comments (${userComments.length})`, icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'tools' && (
        <div>
          {likedTools.length > 0 ? (
            <div className="grid-cards">
              {likedTools.map((tool) => (
                <ToolCard key={tool.id || tool._id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>You have not bookmarked any tools yet.</p>
              <Link href="/tools" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Explore AI Directory
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'workflows' && (
        <div>
          {likedWorkflows.length > 0 ? (
            <div className="grid-cards">
              {likedWorkflows.map((wf) => (
                <WorkflowCard key={wf.id || wf._id} workflow={wf} />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No saved workflows.</p>
              <Link href="/workflows" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Browse Workflows
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div>
          {likedPosts.length > 0 ? (
            <div className="grid-cards">
              {likedPosts.map((post) => (
                <PostCard key={post.id || post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No upvoted posts yet.</p>
              <Link href="/posts" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Visit Community Feed
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {userComments.length > 0 ? (
            userComments.map((c) => (
              <div key={c.id || c._id} className="glass-card" style={{ padding: '20px' }}>
                <p style={{ color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '8px' }}>{c.content}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{c.likes} likes</span>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>You have not posted any comments yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsEditing(false)}
        >
          <div
            className="glass-card slide-up"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '32px',
              backgroundColor: '#121524',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Choose Avatar */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Choose Profile Avatar:
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {avatars.map((av) => (
                  <img
                    key={av.id || av._id}
                    src={av.url}
                    alt={av.name}
                    onClick={() => setEditPhoto(av.url)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: editPhoto === av.url ? '3px solid var(--accent-blue)' : '2px solid transparent',
                      padding: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Display Name:
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0C14',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Creator Bio:
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0A0C14',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveProfile} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
