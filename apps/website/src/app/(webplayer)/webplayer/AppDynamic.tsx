'use client';

import dynamic from 'next/dynamic';

const AppDynamic = dynamic(() => import('./App'), { ssr: false });

export default AppDynamic;