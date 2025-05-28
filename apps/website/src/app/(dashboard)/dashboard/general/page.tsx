'use client';

import { startTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/lib/query/hooks';
import { useUpsertUser } from '@/lib/query/hooks';
import { RZUser } from '@/components/webplayer/data/model';

export default function GeneralPage() {
  const { data: user } = useCurrentUser();
  const updateUserMutation = useUpsertUser();

  const [name, setName] = useState(user?.name || '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // If you call the Server Action directly, it will automatically
    // reset the form. We don't want that here, because we want to keep the
    // client-side values in the inputs. So instead, we use an event handler
    // which calls the action. You must wrap direct calls with startTransition.
    // When you use the `action` prop it automatically handles that for you.
    // Another option here is to persist the values to local storage. I might
    // explore alternative options.
    startTransition(async () => {
      if (!user) {
        return;
      }

      const newUser: RZUser = {
        ...user,
        name
      }

      await updateUserMutation.mutateAsync(newUser);
    });
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-foreground mb-6">
        General Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="text-primary-foreground"
            >
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
