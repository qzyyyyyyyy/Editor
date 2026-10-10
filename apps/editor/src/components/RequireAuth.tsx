import { Layout } from 'antd'
import Login from './Login'
import { Outlet } from 'react-router-dom'
import { isAuthenticated } from '@/services'

const { Header } = Layout
export default function RequireAuth() {
  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    height: 64,
    paddingInline: 10,
    lineHeight: '64px',
    backgroundColor: 'black',
  }

  // 鉴权：未登录时不渲染子路由，
  // 用户只能看到顶栏 + 登录弹窗，无法访问页面内容
  const isAuthed = isAuthenticated()

  return (
    <Layout>
      <Header style={headerStyle}>
        <Login></Login>
      </Header>
      {isAuthed && <Outlet></Outlet>}
    </Layout>
  )
}
