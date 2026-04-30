'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useStore from '../../store/useStore'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute({ children }) {
  const { token } = useStore()
  const router = useRouter()

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router])

  if (!token) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  return children
}
