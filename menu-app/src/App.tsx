import { useState, useEffect } from 'react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Wallet, 
  CheckSquare, 
  LogOut, 
  ArrowRight,
  Boxes,
  Menu,
  ChevronLeft
} from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  picture: string
}

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeApp, setActiveApp] = useState<'dashboard' | 'cash' | 'task'>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Check session storage on load
    const savedToken = sessionStorage.getItem('menu_access_token')
    if (savedToken) {
      setToken(savedToken)
      fetchProfile(savedToken)
    }
  }, [])

  const fetchProfile = async (accessToken: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (err) {
      console.error('Failed to fetch profile', err)
    }
  }

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      const accessToken = codeResponse.access_token
      setToken(accessToken)
      sessionStorage.setItem('menu_access_token', accessToken)
      fetchProfile(accessToken)
    },
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile',
    prompt: 'consent'
  })

  const logout = () => {
    googleLogout()
    setToken(null)
    setProfile(null)
    setActiveApp('dashboard')
    sessionStorage.removeItem('menu_access_token')
  }

  if (!token) {
    return (
      <div className="login-screen">
        <motion.div 
          className="login-card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Boxes className="login-icon" />
          <h1 className="login-title">統合ポータル</h1>
          <p className="login-desc">Googleでログインして、資金管理とタスク管理アプリを一つの画面から利用しましょう。</p>
          <button className="btn-login" onClick={() => login()}>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '24px', height: '24px' }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            Googleでログイン
          </button>
        </motion.div>
      </div>
    )
  }

  const getIframeSrc = () => {
    if (activeApp === 'cash') return `https://kousug.github.io/cash-management/?token=${token}`
    if (activeApp === 'task') return `https://kousug.github.io/task-management/?token=${token}`
    return ''
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <motion.aside 
        className={`sidebar glass ${isSidebarOpen ? '' : 'collapsed'}`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="sidebar-header">
          <div className="brand" style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}>
            <Boxes className="brand-icon" size={28} />
            {isSidebarOpen && <span className="brand-text">ポータル</span>}
          </div>
          
          <button 
            className="btn-toggle-sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="メニューの開閉"
            style={{ 
              alignSelf: isSidebarOpen ? 'center' : 'center',
              marginTop: isSidebarOpen ? 0 : '1.5rem',
              marginLeft: isSidebarOpen ? 'auto' : 0
            }}
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-item ${activeApp === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveApp('dashboard')}
            title="ダッシュボード"
            style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
          >
            <LayoutDashboard className="nav-icon" size={20} />
            {isSidebarOpen && <span className="nav-item-text">ダッシュボード</span>}
          </button>
          <button 
            className={`nav-item ${activeApp === 'cash' ? 'active' : ''}`}
            onClick={() => setActiveApp('cash')}
            title="資金管理 (Cash)"
            style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
          >
            <Wallet className="nav-icon" size={20} />
            {isSidebarOpen && <span className="nav-item-text">資金管理 (Cash)</span>}
          </button>
          <button 
            className={`nav-item ${activeApp === 'task' ? 'active' : ''}`}
            onClick={() => setActiveApp('task')}
            title="タスク管理 (Task)"
            style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center' }}
          >
            <CheckSquare className="nav-icon" size={20} />
            {isSidebarOpen && <span className="nav-item-text">タスク管理 (Task)</span>}
          </button>
        </div>

        {profile && (
          <div className="user-profile" style={{ 
            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
            padding: isSidebarOpen ? '1rem' : '0.75rem 0'
          }}>
            <img src={profile.picture} alt="Avatar" className="avatar" />
            {isSidebarOpen && (
              <div className="user-info">
                <span className="user-name">{profile.name}</span>
                <span className="user-email">Google ドライブ接続済み</span>
              </div>
            )}
            <button 
              className="btn-logout" 
              onClick={logout} 
              title="ログアウト"
              style={{ marginLeft: isSidebarOpen ? 'auto' : 0, marginTop: isSidebarOpen ? 0 : '0.5rem' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeApp === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              className="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="welcome-header">
                <h1 className="welcome-title">おかえりなさい、{profile?.name?.split(' ')[0] || 'ユーザー'}さん</h1>
                <p className="welcome-subtitle">利用するアプリを選択してください</p>
              </div>

              <div className="app-grid">
                <motion.div 
                  className="app-card cash-card glass"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveApp('cash')}
                >
                  <div className="card-icon-wrapper">
                    <Wallet size={32} />
                  </div>
                  <div>
                    <h3 className="card-title">資金管理</h3>
                    <p className="card-desc">収入と支出を簡単に記録・管理します。</p>
                  </div>
                  <ArrowRight className="card-arrow" />
                </motion.div>

                <motion.div 
                  className="app-card task-card glass"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveApp('task')}
                >
                  <div className="card-icon-wrapper">
                    <CheckSquare size={32} />
                  </div>
                  <div>
                    <h3 className="card-title">タスク管理</h3>
                    <p className="card-desc">タスクや納期をわかりやすく整理します。</p>
                  </div>
                  <ArrowRight className="card-arrow" />
                </motion.div>
              </div>

              <div className="dashboard-widget" style={{ marginTop: '3rem', height: '800px' }}>
                <iframe
                  src={`https://kousug.github.io/task-management/?token=${token}&embed=calendar`}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '1.5rem', background: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  title="Task Calendar Widget"
                />
              </div>
            </motion.div>
          ) : (
            <motion.iframe
              key={activeApp}
              src={getIframeSrc()}
              className="iframe-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              title={`${activeApp} application`}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
