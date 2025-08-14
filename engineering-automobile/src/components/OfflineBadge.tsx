"use client";
import { useEffect } from "react";

export function OfflineBadge() {
	useEffect(() => {
		const set = () => {
			if (typeof window === 'undefined') return;
			if (navigator.onLine) document.documentElement.classList.remove('offline');
			else document.documentElement.classList.add('offline');
		};
		set();
		window.addEventListener('online', set);
		window.addEventListener('offline', set);
		return () => {
			window.removeEventListener('online', set);
			window.removeEventListener('offline', set);
		};
	}, []);
	return <div className="badge-offline">Offline Mode</div>;
}