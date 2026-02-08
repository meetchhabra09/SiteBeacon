import './App.css'
import { BrowserRouter, Routes, Route, Link, useNavigate, Outlet } from 'react-router-dom'
import { DashBoard } from './DashBoard'
import { Login } from './Login'
import { SignUp } from './SignUp'
import { Header } from './Header'
import { AddBeacon } from './AddBeacon'
import { EditBeacon } from './EditBeacon'
import { VerifyOtp } from './VerifyOtp'
import { LandingPage } from './LandingPage'
import { LandingHeader } from './LandingHeader'
import { Profile } from './Profile'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPageLayout />}>
            <Route index element={<LandingPage />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<DashBoard />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="add-beacon" element={<AddBeacon />} />
            <Route path="edit-beacon/:id" element={<EditBeacon />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
            <Route path="profile" element={<Profile />} />
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

function LandingPageLayout() {
  return (
    <div>
      <LandingHeader />
      <Outlet />
    </div>
  )
}

export default App
