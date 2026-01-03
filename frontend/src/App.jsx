import './App.css'
import { BrowserRouter, Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom'
import { DashBoard } from './DashBoard'
import { Login } from './Login'
import { SignUp } from './SignUp'
import { Header } from './Header'
import { AddBeacon } from './AddBeacon'
import { VerifyOtp } from './VerifyOtp'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashBoard />} />
            <Route path="dashboard" element={<DashBoard />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="add-beacon" element={<AddBeacon />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

function Layout() {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  )
}

export default App
