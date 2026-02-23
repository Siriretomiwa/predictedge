import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNav } from '../context/NavContext.jsx'
import { STRENGTH, FALLBACK_COMPS } from '../constants.js'

// ── Seed community posts ───────────────────────────────────────────
const SEED_POSTS = [
  {
    id: 'c1', author: 'TunjiAnalytics', authorFlag: '🇳🇬', authorBadge: '👑',
    verified: true, avatar: 'T',
    home: 'Bayern Munich', away: 'Dortmund', league: 'Bundesliga',
    market: 'Over 2.5', pick: 'Over 2.5', strength: 'BANKER',
    confidence: 92, odds: 1.68,
    reasoning: 'Bayern have scored in every home game this season — averaging 3.1 goals. Dortmund ship goals away. This Klassiker almost always goes over. Strong value at 1.68.',
    upvotes: 47, comments: 12, aiAgrees: true,
    postedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'c2', author: 'DataEdgePro', authorFlag: '🇳🇬', authorBadge: '💎',
    verified: true, avatar: 'D',
    home: 'Real Madrid', away: 'Barcelona', league: 'La Liga',
    market: 'BTTS', pick: 'BTTS', strength: 'STRONG',
    confidence: 86, odds: 1.85,
    reasoning: 'El Clásico BTTS has hit in 7 of last 9 meetings. Both sides are in prolific form. Barça\'s pressing game forces mistakes in the final third — expect goals at both ends.',
    upvotes: 38, comments: 9, aiAgrees: true,
    postedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'c3', author: 'StatSharpNG', authorFlag: '🇬🇭', authorBadge: '🔥',
    verified: true, avatar: 'S',
    home: 'Liverpool', away: 'Man City', league: 'Premier League',
    market: 'Over 2.5', pick: 'Over 2.5', strength: 'STRONG',
    confidence: 88, odds: 1.72,
    reasoning: 'These two always produce a show. Liverpool\'s high defensive line leaves space in behind and City exploit it. Over 2.5 in 6 of the last 8 head-to-heads.',
    upvotes: 29, comments: 7, aiAgrees: true,
    postedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'c4', author: 'OddsWhisperer', authorFlag: '🇿🇦', authorBadge: '📊',
    verified: false, avatar: 'O',
    home: 'PSG', away: 'Marseille', league: 'Ligue 1',
    market: 'PSG Win', pick: 'PSG Win', strength: 'SAFE',
    confidence: 82, odds: 1.40,
    reasoning: 'PSG at home vs Marseille is almost always one-sided. PSG haven\'t lost this fixture at the Parc des Princes since 2012. Odds are short but value is real.',
    upvotes: 22, comments: 5, aiAgrees: false,
    postedAt: new Date(Date.now() - 9 * 3600000).toISOString(),
  },
  {
    id: 'c5', author: 'xGMaster', authorFlag: '🇰🇪', authorBadge: '⚽',
    verified: false, avatar: 'X',
    home: 'Inter Milan', away: 'AC Milan', league: 'Serie A',
    market: 'BTTS', pick: 'BTTS', strength: 'MODERATE',
    confidence: 74, odds: 1.90,
    reasoning: 'Derby della Madonnina is always intense. Both sides have quality attackers but Serie A derbies can be cagey. I lean BTTS but acknowledge the risk — hence moderate confidence.',
    upvotes: 15, comments: 8, aiAgrees: true,
    postedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'c6', author: 'BankrollKing', authorFlag: '🇳🇬', authorBadge: '💰',
    verified: true, avatar: 'B',
    home: 'Ajax', away: 'PSV', league: 'Eredivisie',
    market: 'Over 2.5', pick: 'Over 2.5', strength: 'BANKER',
    confidence: 90, odds: 1.70,
    reasoning: 'Dutch top-flight games are notoriously open. Ajax average 2.8 goals per home game and PSV average 2.2 away. Over 2.5 has landed in 8 of the last 10 meetings.',
    upvotes: 41, comments: 11, aiAgrees: true,
    postedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'c7', author: 'PoissonPro', authorFlag: '🇳🇬', authorBadge: '📈',
    verified: false, avatar: 'P',
    home: 'Juventus', away: 'AC Milan', league: 'Serie A',
    market: 'Over 1.5', pick: 'Over 1.5', strength: 'SAFE',
    confidence: 81, odds: 1.44,
    reasoning: 'Both teams have quality in attack but Juve\'s home record and Milan\'s tendency to concede late makes at least 2 goals very likely. Under-priced for how reliable this is.',
    upvotes: 18, comments: 4, aiAgrees: true,
    postedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'c8', author: 'QuantBettor', authorFlag: '🇳🇬', authorBadge: '📉',
    verified: false, avatar: 'Q',
    home: 'Porto', away: 'Benfica', league: 'Primeira Liga',
    market: 'Over 2.5', pick: 'Over 2.5', strength: 'RISKY',
    confidence: 64, odds: 2.05,
    reasoning: 'Portuguese top derbies can be tight but the recent trend for this fixture has been goals. I\'m cautious — hence RISKY — but the value at 2.05 makes it worth a small stake.',
    upvotes: 9, comments: 6, aiAgrees: false,
    postedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
  },
]

const MARKETS_LIST = ['Over 1.5','Over 2.5','Over 3.5','BTTS','Home Win','Away Win','Draw']
const LEAGUES_LIST  = FALLBACK_COMPS.map(c => c.name)
const STRENGTHS_LIST = ['BANKER','STRONG','SAFE','MODERATE','RISKY']

function timeAgo(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (d < 1)  return 'just now'
  if (d < 60) return `${d}m ago`
  if (d < 1440) return `${Math.floor(d/60)}h ago`
  return `${Math.floor(d/1440)}d ago`
}

export default function CommunityPage() {
  const { user, setAuthModal } = useAuth()
  const { navigate } = useNav()

  const [posts, setPosts]         = useState(SEED_POSTS)
  const [sort, setSort]           = useState('HOT')   // HOT | NEW | TOP
  const [filterStr, setFilterStr] = useState('ALL')   // ALL | BANKER | STRONG | …
  const [showForm, setShowForm]   = useState(false)
  const [upvoted, setUpvoted]     = useState({})      // id → bool
  const [following, setFollowing] = useState({})      // author → bool
  const [expandedId, setExpandedId] = useState(null)

  // Sort + filter
  const sorted = [...posts]
    .filter(p => filterStr === 'ALL' || p.strength === filterStr)
    .sort((a,b) => {
      if (sort === 'HOT') return (b.upvotes * 2 + b.comments) - (a.upvotes * 2 + a.comments)
      if (sort === 'NEW') return new Date(b.postedAt) - new Date(a.postedAt)
      if (sort === 'TOP') return b.upvotes - a.upvotes
      return 0
    })

  const handleUpvote = useCallback((id) => {
    if (!user) { setAuthModal(true); return }
    setUpvoted(prev => {
      const was = prev[id]
      setPosts(ps => ps.map(p => p.id === id ? { ...p, upvotes: p.upvotes + (was ? -1 : 1) } : p))
      return { ...prev, [id]: !was }
    })
  }, [user, setAuthModal])

  const handleFollow = useCallback((author) => {
    if (!user) { setAuthModal(true); return }
    setFollowing(prev => ({ ...prev, [author]: !prev[author] }))
  }, [user, setAuthModal])

  const addPost = useCallback((post) => {
    setPosts(prev => [post, ...prev])
    setShowForm(false)
  }, [])

  const totalToday  = posts.length
  const activeUsers = 47
  const topPick     = [...posts].sort((a,b) => b.upvotes-a.upvotes)[0]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-sans)' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Community</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(28px,4vw,44px)', color: 'var(--text-1)', marginBottom: 8 }}>Community Picks</h1>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Real punters sharing real analysis. Upvote what you trust. Post your own edge.</p>
          </div>
          <button
            onClick={() => user ? setShowForm(true) : setAuthModal(true)}
            className="btn-primary"
            style={{ padding: '11px 22px', fontSize: 14, flexShrink: 0 }}>
            + Share a Pick
          </button>
        </div>

        {/* Live stats bar */}
        <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { icon: '⚡', label: `${totalToday} picks today` },
            { icon: '👥', label: `${activeUsers} punters active` },
            { icon: '🏆', label: `Top pick: ${topPick?.home} vs ${topPick?.away} — ${topPick?.upvotes} votes` },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
              <span>{s.icon}</span><span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Post form ── */}
      {showForm && (
        <PostForm user={user} onSubmit={addPost} onCancel={() => setShowForm(false)} />
      )}

      {/* ── Filters & sort ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        {/* Strength filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', ...STRENGTHS_LIST].map(s => {
            const cfg = STRENGTH[s]
            const active = filterStr === s
            return (
              <button key={s} onClick={() => setFilterStr(s)} style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${active ? (cfg?.color || 'var(--green)') : 'var(--border)'}`, background: active ? (cfg?.bg || '#00FF6A10') : 'transparent', color: active ? (cfg?.color || 'var(--green)') : 'var(--text-3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .14s' }}>
                {s === 'ALL' ? 'All Signals' : `${cfg?.icon} ${s}`}
              </button>
            )
          })}
        </div>
        {/* Sort */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['HOT','NEW','TOP'].map(s => (
            <button key={s} onClick={() => setSort(s)} style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${sort===s?'var(--green)':'var(--border)'}`, background: sort===s?'#00FF6A10':'transparent', color: sort===s?'var(--green)':'var(--text-3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {s==='HOT'?'🔥 Hot':s==='NEW'?'🆕 New':'👑 Top'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {sorted.length === 0
          ? (
            <div style={{ padding: 60, textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ color: 'var(--text-2)' }}>No picks for this filter yet. Be the first!</div>
              <button onClick={() => user ? setShowForm(true) : setAuthModal(true)} className="btn-primary" style={{ marginTop: 16, padding: '10px 24px', fontSize: 13 }}>Post a Pick</button>
            </div>
          )
          : sorted.map(post => (
            <PostCard
              key={post.id} post={post}
              upvoted={!!upvoted[post.id]}
              following={!!following[post.author]}
              expanded={expandedId === post.id}
              onUpvote={() => handleUpvote(post.id)}
              onFollow={() => handleFollow(post.author)}
              onExpand={() => setExpandedId(expandedId === post.id ? null : post.id)}
              user={user}
              setAuthModal={setAuthModal}
              navigate={navigate}
            />
          ))
        }
      </div>

      {/* ── CTA for guests ── */}
      {!user && (
        <div style={{ marginTop: 36, padding: '32px', background: 'var(--surface)', border: '1px solid var(--border-hi)', borderRadius: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 14 }}>💬</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--text-1)', marginBottom: 8 }}>Join the conversation</h3>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.65 }}>Sign up free to post your picks, upvote the best tips, follow top tipsters, and build your community reputation.</p>
          <button onClick={() => setAuthModal(true)} className="btn-primary" style={{ padding: '12px 32px', fontSize: 14 }}>Create Free Account →</button>
        </div>
      )}
    </div>
  )
}

// ── Individual post card ───────────────────────────────────────────
function PostCard({ post, upvoted, following, expanded, onUpvote, onFollow, onExpand, user, setAuthModal, navigate }) {
  const cfg = STRENGTH[post.strength] || STRENGTH.MODERATE
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)

  const submitComment = () => {
    if (!commentText.trim()) return
    if (!user) { setAuthModal(true); return }
    setComments(prev => [...prev, { id: Date.now(), text: commentText, author: user.name, avatar: user.avatar, time: 'just now' }])
    setCommentText('')
  }

  const totalComments = post.comments + comments.length

  return (
    <div style={{ background: 'var(--surface)', border: `1px solid ${expanded ? cfg.glow : 'var(--border)'}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color .2s' }}>
      {/* BANKER pulse bar */}
      {post.strength === 'BANKER' && (
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${cfg.color},transparent)`, animation: 'pulse 2.5s infinite' }} />
      )}

      {/* Main content */}
      <div style={{ padding: '16px 18px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green-dim),var(--surface-3))', border: `1px solid ${post.verified?cfg.color:'var(--border-hi)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: post.verified?cfg.color:'var(--text-2)', flexShrink: 0 }}>
            {post.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{post.authorFlag} {post.author}</span>
              {post.verified && <span style={{ fontSize: 10, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.glow}`, padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{post.authorBadge} Verified</span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{timeAgo(post.postedAt)} · {post.league}</div>
          </div>
          <button
            onClick={() => onFollow()}
            style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${following?cfg.color:'var(--border-hi)'}`, background: following?cfg.bg:'transparent', color: following?cfg.color:'var(--text-3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .14s', flexShrink: 0 }}>
            {following ? '✓ Following' : '+ Follow'}
          </button>
        </div>

        {/* Match & pick */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            {post.home} <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 13 }}>vs</span> {post.away}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Pick badge */}
            <div style={{ padding: '5px 13px', background: cfg.bg, border: `1px solid ${cfg.glow}`, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6, boxShadow: post.strength==='BANKER'?`0 0 12px ${cfg.glow}`:'none' }}>
              <span style={{ fontSize: 12 }}>{cfg.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{post.pick}</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{post.strength}</span>
            </div>
            {/* Confidence */}
            <div style={{ padding: '5px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: cfg.color }}>
              {post.confidence}%
            </div>
            {/* Odds */}
            {post.odds && (
              <div style={{ padding: '5px 10px', background: 'var(--surface-2)', border: '1px solid #EAB84020', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)' }}>
                @ {post.odds}
              </div>
            )}
            {/* AI agrees badge */}
            {post.aiAgrees && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#00FF6A08', border: '1px solid #00FF6A20', borderRadius: 20, fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                <span style={{ fontSize: 10 }}>🤖</span> AI agrees
              </div>
            )}
            {!post.aiAgrees && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#EAB84008', border: '1px solid #EAB84020', borderRadius: 20, fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>
                <span style={{ fontSize: 10 }}>🤖</span> AI differs
              </div>
            )}
          </div>
        </div>

        {/* Reasoning preview / expanded */}
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
          {expanded
            ? post.reasoning
            : post.reasoning.length > 120
              ? <>{post.reasoning.slice(0, 120)}… <span onClick={onExpand} style={{ color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}>Read more</span></>
              : post.reasoning
          }
          {expanded && post.reasoning.length > 120 && (
            <span onClick={onExpand} style={{ color: 'var(--text-3)', cursor: 'pointer', marginLeft: 6, fontSize: 12 }}>Show less</span>
          )}
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {/* Upvote */}
          <button onClick={onUpvote} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: `1px solid ${upvoted?'var(--green)':'var(--border)'}`, background: upvoted?'#00FF6A10':'transparent', color: upvoted?'var(--green)':'var(--text-3)', fontSize: 13, fontWeight: upvoted?700:400, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .14s' }}>
            <span style={{ fontSize: 14 }}>{upvoted ? '▲' : '△'}</span>
            <span>{post.upvotes}</span>
          </button>
          {/* Comments */}
          <button onClick={() => setShowComments(!showComments)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: showComments?'var(--surface-3)':'transparent', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .14s' }}>
            <span>💬</span><span>{totalComments}</span>
          </button>
          {/* Share */}
          <button onClick={() => { navigator.clipboard?.writeText(`${post.home} vs ${post.away} — ${post.pick} (${post.confidence}%) on PredictEdge`).catch(()=>{}) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', marginLeft: 'auto' }}>
            <span>↗</span><span style={{ fontSize: 12 }}>Share</span>
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)', padding: '14px 18px' }}>
          {/* Existing comments */}
          {post.comments > 0 && comments.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10, fontStyle: 'italic' }}>
              {post.comments} comment{post.comments!==1?'s':''} — sign in to view and join the discussion
            </div>
          )}
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--green)', flexShrink: 0 }}>{c.avatar}</div>
              <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{c.author} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{c.time}</span></div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{c.text}</div>
              </div>
            </div>
          ))}
          {/* Comment input */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {user && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--green-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000', flexShrink: 0 }}>{user.avatar}</div>
            )}
            <input
              value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder={user ? 'Add your analysis…' : 'Sign in to comment'}
              onClick={() => !user && setAuthModal(true)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border)', cursor: !user ? 'pointer' : 'text' }}
            />
            {user && (
              <button onClick={submitComment} className="btn-primary" style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}>Post</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Post a pick form ───────────────────────────────────────────────
function PostForm({ user, onSubmit, onCancel }) {
  const [home, setHome]       = useState('')
  const [away, setAway]       = useState('')
  const [league, setLeague]   = useState(LEAGUES_LIST[0])
  const [market, setMarket]   = useState(MARKETS_LIST[0])
  const [strength, setStr]    = useState('STRONG')
  const [confidence, setConf] = useState(80)
  const [odds, setOdds]       = useState('')
  const [reasoning, setReas]  = useState('')
  const [error, setError]     = useState('')

  const submit = () => {
    setError('')
    if (!home.trim() || !away.trim()) { setError('Enter both team names.'); return }
    if (reasoning.trim().length < 20) { setError('Please add at least 20 characters of reasoning. Quality analysis only!'); return }
    const post = {
      id: `c_${Date.now()}`,
      author: user.name, authorFlag: '🏳️', authorBadge: '',
      verified: false, avatar: user.avatar,
      home: home.trim(), away: away.trim(), league,
      market, pick: market, strength,
      confidence: Number(confidence),
      odds: odds ? Number(odds) : null,
      reasoning: reasoning.trim(),
      upvotes: 0, comments: 0, aiAgrees: false,
      postedAt: new Date().toISOString(),
    }
    onSubmit(post)
  }

  const cfg = STRENGTH[strength]

  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-hi)', borderRadius: 14, padding: '24px', marginBottom: 24, animation: 'fadeUp .2s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 22, color: 'var(--text-1)' }}>Share Your Pick</div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20 }}>×</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <Label text="Home Team" />
          <input value={home} onChange={e => setHome(e.target.value)} placeholder="e.g. Arsenal" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
        </div>
        <div>
          <Label text="Away Team" />
          <input value={away} onChange={e => setAway(e.target.value)} placeholder="e.g. Man City" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <Label text="League" />
          <select value={league} onChange={e => setLeague(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-sans)' }}>
            {LEAGUES_LIST.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <Label text="Market / Pick" />
          <select value={market} onChange={e => setMarket(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-sans)' }}>
            {MARKETS_LIST.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <Label text="Odds (optional)" />
          <input value={odds} onChange={e => setOdds(e.target.value)} placeholder="e.g. 1.85" type="number" step="0.01" min="1" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <Label text="Signal Level" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STRENGTHS_LIST.map(s => {
              const c = STRENGTH[s]
              return (
                <button key={s} onClick={() => setStr(s)} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${strength===s?c.color:'var(--border)'}`, background: strength===s?c.bg:'transparent', color: strength===s?c.color:'var(--text-3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                  {c.icon} {s}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <Label text={`Confidence: ${confidence}%`} />
          <input type="range" min="55" max="97" value={confidence} onChange={e => setConf(e.target.value)}
            style={{ width: '100%', marginTop: 8, accentColor: cfg.color }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
            <span>55%</span><span style={{ color: cfg.color, fontWeight: 700 }}>{confidence}%</span><span>97%</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Label text="Your Analysis (min 20 chars)" />
        <textarea
          value={reasoning} onChange={e => setReas(e.target.value)}
          placeholder="Why do you like this pick? Share your reasoning — statistics, form, H2H, value. Quality analysis earns more upvotes."
          rows={4}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, resize: 'vertical', fontFamily: 'var(--font-sans)' }}
        />
        <div style={{ fontSize: 11, color: reasoning.length >= 20 ? 'var(--green)' : 'var(--text-3)', marginTop: 4, textAlign: 'right' }}>
          {reasoning.length} chars {reasoning.length >= 20 ? '✓' : `(${20 - reasoning.length} more needed)`}
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, padding: '8px 12px', background: '#FF404010', border: '1px solid #FF404030', borderRadius: 6, fontSize: 12, color: 'var(--red)' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={submit} className="btn-primary" style={{ padding: '11px 28px', fontSize: 14 }}>Post Pick →</button>
        <button onClick={onCancel} className="btn-ghost" style={{ padding: '11px 20px', fontSize: 14 }}>Cancel</button>
      </div>
    </div>
  )
}

function Label({ text }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>{text}</div>
}
