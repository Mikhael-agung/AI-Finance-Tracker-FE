'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'financeflow:balance-visible';

/**
 * Toggle privasi saldo (hide/show). Persist ke localStorage biar
 * kepilih ulang setiap buka app, bukan reset tiap pindah halaman.
 */
export function useBalanceVisibility() {
    const [visible, setVisible] = useState(true);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) setVisible(stored === 'true');
        setHydrated(true);
    }, []);

    const toggle = () => {
        setVisible((prev) => {
            const next = !prev;
            window.localStorage.setItem(STORAGE_KEY, String(next));
            return next;
        });
    };

    // Sebelum hydrated, anggap visible=true (default aman, hindari flash tersembunyi
    // yang salah pas SSR/first paint belum baca localStorage).
    return { visible: hydrated ? visible : true, toggle };
}