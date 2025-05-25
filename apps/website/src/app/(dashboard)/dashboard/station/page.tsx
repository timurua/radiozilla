'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateUserStation, useUserSuspense } from '@/lib/query/hooks';
import { RZStation } from '@/components/webplayer/data/model';
import { Button } from '@/components/ui/button';
import { useUserStationSuspense } from '@/lib/query/hooks';
import { Suspense } from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotification } from '@/components/webplayer/providers/NotificationProvider';

export default function StationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StationComponent />
        </Suspense>
    );
}

function StationComponent() {
    const { data: station } = useUserStationSuspense();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Station</CardTitle>
            </CardHeader>
            <CardContent>
                <StationForm station={station} />
            </CardContent>
        </Card>
    );
}

function StationForm({ station }: { station: RZStation }) {
    const [name, setName] = useState(station?.name || '');
    const [description, setDescription] = useState(station?.description || '');
    const { showInfo, showWarning } = useNotification();
    const updateStation = useUpdateUserStation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            updateStation.mutate({
                ...station,
                name,
                description,
            });
            showInfo("Station updated successfully");

        } catch (error) {
            showWarning("Failed to update station");
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <Label htmlFor="name" className="mb-2">
                    Station Name
                </Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Enter station name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="description" className="mb-2">
                    Description
                </Label>
                <Input
                    id="description"
                    name="description"
                    placeholder="Enter station description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <Button
                type="submit"
                className="text-primary-foreground"
            >
                Save Changes
            </Button>
        </form>
    );
}

