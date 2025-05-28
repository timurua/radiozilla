import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserPermissionsSuspense, useCurrentUserSuspense } from '@/lib/query/hooks';

export function PermissionsPage() {
    const user = useCurrentUserSuspense();

    const { data: permissions } = useCurrentUserPermissionsSuspense();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    {permissions?.map((permission) => (
                        <li key={`${permission.userId}-${permission.permissionTargetName}-${permission.permissionTargetId}-${permission.permission}`}>
                            {permission.permissionTargetName} - {permission.permissionTargetId} - {permission.permission}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
