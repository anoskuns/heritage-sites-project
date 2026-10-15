import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from '../App'
import { LandingPage } from '../pages/landing/LandingPage'
import { AuthPage } from '../pages/auth/AuthPage'
import { UnlockPage } from '../pages/unlock/UnlockPage'
import { QrRedirect } from '../pages/unlock/QrRedirect'
import { PassportPage } from '../pages/passport/PassportPage'
import { MapPage } from '../pages/map/MapPage'
import { HeritageDetailPage } from '../pages/heritage-detail/HeritageDetailPage'
import { CommunityPage } from '../pages/community/CommunityPage'
import { CreatePostPage } from '../pages/create-post/CreatePostPage'
import { ProfilePage } from '../pages/profile/ProfilePage'
import { ProtectedRoute } from '../features/authentication'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'unlock', element: <UnlockPage /> },
      { path: 'qr/:token', element: <QrRedirect /> },
      {
        path: 'passport',
        element: (
          <ProtectedRoute>
            <PassportPage />
          </ProtectedRoute>
        ),
      },
      { path: 'map', element: <MapPage /> },
      { path: 'heritage/:slug', element: <HeritageDetailPage /> },
      { path: 'community', element: <CommunityPage /> },
      {
        path: 'community/create',
        element: (
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
