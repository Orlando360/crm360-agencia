import { AuthProvider, useAuth } from './AuthContext'
import CRM360 from './CRM360'
import Login from './Login'

function Inner() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#F5F0E8",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:"3px solid #E8E2D5",borderTop:"3px solid #C9A96E",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
  return user ? <CRM360 /> : <Login />
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>
}
