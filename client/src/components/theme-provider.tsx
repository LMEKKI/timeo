import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth-client'

export function ThemeProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth()

	useEffect(() => {
		const root = document.documentElement
		root.classList.remove('dark')
		if (user?.role === 'chef') root.classList.add('dark')
	}, [user?.role])

	return <>{children}</>
}
