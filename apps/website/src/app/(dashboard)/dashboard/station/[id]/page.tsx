'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateUserStation, useUpdateUserStation, useUserStationChannelsSuspense } from '@/lib/query/hooks';
import { RZChannel, RZStation } from '@/components/webplayer/data/model';
import { Button } from '@/components/ui/button';
import { useUserStationSuspense } from '@/lib/query/hooks';
import { Suspense } from 'react';
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
    imageUrl: z.string().url().optional(),
    isPublic: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

interface StationPageProps {
    params: {
        id: string;
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function StationPage({ params }: StationPageProps) {
    const { id } = params;
    const stationId = id === 'new' ? null : Number(id);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StationComponent stationId={stationId} />
        </Suspense>
    );
}

function StationComponent({ stationId }: { stationId: number | null }) {
    const { data: station } = stationId ? useUserStationSuspense({ id: stationId }) : {
        data: {
            id: 0,
            name: '',
            description: '',
            imageUrl: '',
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    };

    if (!station) {
        return (
            <div>
                Station not found
                <Link href="/dashboard/station/new">
                    <Button>Create a new station</Button>
                </Link>
            </div>
        );
    }

    const { data: channels } = stationId ? useUserStationChannelsSuspense({ id: stationId }) : {
        data: []
    };

    return (<>
        <Card>
            <CardHeader>
                <CardTitle>{stationId === null ? 'Create a new station' : 'Station'}</CardTitle>
            </CardHeader>
            <CardContent>
                <StationForm station={station} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Channels</CardTitle>
            </CardHeader>
            <CardContent>
                <StationChannelsList channels={channels} />
            </CardContent>
        </Card>
    </>
    );
}

function StationForm({ station }: { station: RZStation }) {
    const { showInfo, showWarning } = useNotification();
    const createUserStation = useCreateUserStation();
    const updateUserStation = useUpdateUserStation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isDirty, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: station?.name || '',
            description: station?.description || '',
            imageUrl: station?.imageUrl || '',
            isPublic: station?.isPublic || false,
        },
        mode: 'onChange' // Validate on change for better UX
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            if (station?.id === 0) {
                await createUserStation.mutateAsync({
                    id: 0,
                    name: data.name,
                    description: data.description,
                    imageUrl: data.imageUrl || null,
                    isPublic: data.isPublic || false,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                showInfo("Station created successfully");
            } else {
                await updateUserStation.mutateAsync({
                    ...station!,
                    name: data.name,
                    description: data.description,
                    imageUrl: data.imageUrl || null,
                    isPublic: data.isPublic || false,
                    updatedAt: new Date()
                });
                showInfo("Station updated successfully");
            }
        } catch {
            showWarning("Failed to create/update station");
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
                    className={errors.name ? "border-red-500" : ""}
                    {...register('name')}
                />
                {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
            </div>
            <div>
                <Label htmlFor="description" className="mb-2">
                    Description
                </Label>
                <Input
                    id="description"
                    placeholder="Enter station description"
                    className={errors.description ? "border-red-500" : ""}
                    {...register('description')}
                />
                {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
            </div>
            <div>
                <Label htmlFor="imageUrl" className="mb-2">
                    Image URL
                </Label>
                <Input
                    id="imageUrl"
                    placeholder="Enter image URL"
                    className={errors.imageUrl ? "border-red-500" : ""}
                    {...register('imageUrl')}
                />
                {errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
                )}
            </div>
            <div>
                <Label htmlFor="isPublic" className="mb-2">
                    Public
                </Label>
                <input
                    type="checkbox"
                    id="isPublic"
                    className={errors.isPublic ? "border-red-500" : ""}
                    {...register('isPublic')}
                />
                {errors.isPublic && (
                    <p className="text-red-500 text-sm mt-1">{errors.isPublic.message}</p>
                )}
            </div>

            <Button
                type="submit"
                className="text-primary-foreground"
                disabled={isSubmitting || (!isDirty) || (isDirty && !isValid)}
            >
                {station?.id === 0 ? 'Create' : 'Save Changes'}
            </Button>
        </form>
    );
}

function StationChannelsList({ channels }: { channels: RZChannel[] }) {
    return (
        <div>
            {channels.length === 0 && <div>No channels found</div>}
            <ul>
                {channels.map((channel) => (
                    <li className="row" key={channel.id}>
                        <div>{channel.name}</div>
                        <div>{channel.description}</div>
                        <div>{channel.imageUrl}</div>
                        <div>{channel.isPublic}</div>
                        <div>
                            <Link href={`/dashboard/channel/${channel.id}`}>
                                <Button>View</Button>
                            </Link>
                            <Button>Delete</Button>
                        </div>
                    </li>

                ))}
            </ul>
            <Button>Add Channel</Button>
        </div>
    );
}
