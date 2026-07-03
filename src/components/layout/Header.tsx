import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-white tracking-tight">
          壁纸画廊
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-400">
          <Link to="/" className="hover:text-white transition-colors">首页</Link>
          <Link to="/browse" className="hover:text-white transition-colors">浏览</Link>
        </nav>
      </div>
    </header>
  )
}
