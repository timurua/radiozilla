import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RZStation } from "@/components/webplayer/data/model";

interface StationCardProps {
  station: RZStation;
}

export function StationCard({ station }: StationCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{station.name || 'Unnamed Station'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {station.description && (
          <p className="text-sm text-muted-foreground">
            {station.description || 'No description available'}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/station/${station.id}`}>
            View Station
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
