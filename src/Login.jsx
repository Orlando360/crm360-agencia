import { useState } from "react"
import { useAuth } from "./AuthContext"

const BG   = "#F5F0E8"
const CARD = "#FFFFFF"
const ACC  = "#C9A96E"
const TXT  = "#2C2C2C"
const MUTED= "#8A8580"
const BORDER = "#E8E2D5"

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]     = useState("login")   // "login" | "register"
  const [email, setEmail]   = useState("")
  const [pass, setPass]     = useState("")
  const [error, setError]   = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess(""); setLoading(true)
    if (mode === "login") {
      const { error: err } = await signIn(email, pass)
      if (err) setError(err.message)
    } else {
      const { error: err } = await signUp(email, pass)
      if (err) setError(err.message)
      else setSuccess("Registro exitoso. Revisa tu email para confirmar tu cuenta.")
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:"100vh", background:BG, display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Inter',sans-serif", padding:20
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div style={{
        background:CARD, borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:380,
        boxShadow:"0 8px 40px rgba(44,44,44,0.08)", border:`1px solid ${BORDER}`
      }}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <div style={{
            width:48, height:48, background:ACC, borderRadius:13,
            display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:12
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={CARD} strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div style={{fontSize:18, fontWeight:700, color:TXT, letterSpacing:"0.01em"}}>CRM 360™</div>
          <div style={{fontSize:11, color:MUTED, marginTop:2, letterSpacing:"0.08em"}}>AGENCIA ORLANDO</div>
        </div>

        <div style={{fontSize:13, fontWeight:600, color:TXT, marginBottom:20, textAlign:"center"}}>
          {mode === "login" ? "Inicia sesión en tu cuenta" : "Crear nueva cuenta"}
        </div>

        <form onSubmit={submit}>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11, color:MUTED, fontWeight:500, display:"block", marginBottom:5, letterSpacing:"0.05em"}}>
              EMAIL
            </label>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              placeholder="hola@agencia.co"
              style={{
                width:"100%", padding:"10px 13px", borderRadius:10, fontSize:13,
                border:`1.5px solid ${BORDER}`, background:BG, color:TXT,
                outline:"none", fontFamily:"inherit", boxSizing:"border-box"
              }}
            />
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:11, color:MUTED, fontWeight:500, display:"block", marginBottom:5, letterSpacing:"0.05em"}}>
              CONTRASEÑA
            </label>
            <input
              type="password" value={pass} onChange={e=>setPass(e.target.value)} required
              placeholder="••••••••"
              style={{
                width:"100%", padding:"10px 13px", borderRadius:10, fontSize:13,
                border:`1.5px solid ${BORDER}`, background:BG, color:TXT,
                outline:"none", fontFamily:"inherit", boxSizing:"border-box"
              }}
            />
          </div>

          {error   && <div style={{fontSize:12, color:"#B85C50", background:"#FDF0EE", border:"1px solid #F5D0CB", borderRadius:8, padding:"9px 12px", marginBottom:14}}>{error}</div>}
          {success && <div style={{fontSize:12, color:"#5C8A4A", background:"#F0F7ED", border:"1px solid #C8E0C0", borderRadius:8, padding:"9px 12px", marginBottom:14}}>{success}</div>}

          <button type="submit" disabled={loading} style={{
            width:"100%", padding:"11px", borderRadius:11, border:"none",
            background:ACC, color:"#fff", fontWeight:700, fontSize:13,
            cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1,
            fontFamily:"inherit", letterSpacing:"0.02em"
          }}>
            {loading ? "..." : mode === "login" ? "Entrar →" : "Crear cuenta →"}
          </button>
        </form>

        <div style={{textAlign:"center", marginTop:18, fontSize:12, color:MUTED}}>
          {mode === "login" ? (
            <>¿No tienes cuenta?{" "}
              <span onClick={()=>{setMode("register");setError("");setSuccess("")}}
                style={{color:ACC, fontWeight:600, cursor:"pointer"}}>Regístrate</span>
            </>
          ) : (
            <>¿Ya tienes cuenta?{" "}
              <span onClick={()=>{setMode("login");setError("");setSuccess("")}}
                style={{color:ACC, fontWeight:600, cursor:"pointer"}}>Inicia sesión</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
