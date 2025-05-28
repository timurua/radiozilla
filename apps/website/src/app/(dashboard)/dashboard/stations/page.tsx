'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';
import { useUserStationsSuspense } from '@/lib/query/hooks';
import { StationCard } from '@/components/StationCard';

export default function StationsPage() {
    return <Suspense fallback={<div>Loading...</div>}>
        <StationsPageContent />
    </Suspense>
}

function StationsPageContent() {
    const { data: stations } = useUserStationsSuspense();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stations</CardTitle>
            </CardHeader>
            <CardContent>
                {stations.length === 0 && (
                    <div className="row">
                        <p>No stations found</p>
                    </div>
                )}
                <div className="row">
                    {stations.map(station => (
                        <div key={station.id} className="col-md-4">
                            <StationCard station={station} />
                        </div>
                    ))}
                </div>
                <div className="row">
                    <Link href="/dashboard/station/new">
                        <Button>Create a new station</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
