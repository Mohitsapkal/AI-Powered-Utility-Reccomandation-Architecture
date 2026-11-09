/**
 * Global Brand Configuration for easy customization and replacement.
 * To update the brand name, logo, or theme, modify this file.
 */
export const BRAND = {
  name: 'AURA',
  fullName: 'AURA AI',
  tagline: 'AI UTILITY RECOMMENDATION',
  subtitle: 'AI Utility Recommendation Platform',
  description:
    'The premier AI utility recommendation platform. Discover 1,200+ curated AI tools, compare performance, copy verified prompts, and build automated multi-tool workflows with AURA.',

  // Brand Media Assets (located in /public/brand/)
  logoIcon: '/brand/aura-icon.png',
  logoFull: '/brand/aura-full.png',

  // AI Assistant Identity
  assistantName: 'Aura AI',
  assistantRole: 'AI Utility & Workflow Assistant',
  assistantGreeting:
    "Hi, I'm **Aura AI** — your AI Utility Recommendation assistant! How can I help you find the best AI tools or build your automated workflow today?",

  // Theme Palette Tokens (Sunset Orange -> Radiant Coral -> Crimson Ruby)
  colors: {
    primary: '#FF4A5A',
    orange: '#EE7433',
    coral: '#ED5F39',
    crimson: '#CF2F39',
    gradient: 'linear-gradient(135deg, #FF6A3D 0%, #FA3A52 50%, #CF2F39 100%)',
    gradientHover: 'linear-gradient(135deg, #FF7D54 0%, #FF4D64 50%, #E02340 100%)',
    gradientGlass: 'linear-gradient(135deg, rgba(255, 106, 61, 0.15) 0%, rgba(250, 58, 82, 0.08) 100%)',
    glow: 'rgba(250, 58, 82, 0.35)',
    glowSubtle: 'rgba(255, 106, 61, 0.18)',
  },

  // SEO & Head Metadata
  meta: {
    title: 'AURA — AI Utility Recommendation & Automated Workflows',
    description:
      'Discover 1,200+ curated AI utilities, tested prompts, and automated step-by-step generative workflows with AURA.',
    keywords: [
      'AURA',
      'AI Utility Recommendation',
      'AI Tools Directory',
      'AI Workflows',
      'Generative AI Directory',
      'Curated AI',
    ],
  },
};
