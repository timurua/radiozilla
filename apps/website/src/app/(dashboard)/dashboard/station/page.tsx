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
import { z } from 'zod';

const schema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
    description: z
        .string()
        .min(1, 'Description is required')
        .min(2, 'Description must be at least 2 characters'),
});

type FormData = z.infer<typeof schema>;

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';


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
    const { showInfo, showWarning } = useNotification();
    const updateStation = useUpdateUserStation();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting, isDirty, isValid },
        reset
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            description: '',
        },
        mode: 'onChange' // Validate on change for better UX
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            updateStation.mutate({
                ...station,
                name: data.name,
                description: data.description,
            });
            showInfo("Station updated successfully");

        } catch (error) {
            showWarning("Failed to update station");
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <Label htmlFor="name" className="mb-2">
                    Station Name
                </Label>
                <Input
                    id="name"
                    placeholder="Enter station name"
                    {...register('name')}
                />
            </div>
            <div>
                <Label htmlFor="description" className="mb-2">
                    Description
                </Label>
                <Input
                    id="description"
                    placeholder="Enter station description"
                    {...register('description')}
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

