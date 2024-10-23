import { Image, ListGroup } from "react-bootstrap";
import { Playable } from "../data/model";

  // Static method to bucket playables by date
function bucketByDate(playables: Playable[]): Map<string, Playable[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const buckets = new Map<string, Playable[]>([
      ["Today", []],
      ["Yesterday", []],
      ["LastWeek", []],
      ["LastYear", []],
    ]);

    playables.forEach((playable) => {
      const createdAt = new Date(playable.createdAt);

      if (isSameDay(createdAt, today)) {
        buckets.get("Today")!.push(playable);
      } else if (isSameDay(createdAt, yesterday)) {
        buckets.get("Yesterday")!.push(playable);
      } else if (createdAt >= startOfWeek) {
        buckets.get("LastWeek")!.push(playable);
      } else if (createdAt >= startOfYear) {
        buckets.get("LastYear")!.push(playable);
      }
    });

    return buckets;
  }


// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function PlayableList() {
    return (
        <>
            <h5>Quick Picks</h5>
            <ListGroup variant="flush">
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Weigh, Hey and up She Rises</div>
                        <small>The Irish Rovers</small>
                    </div>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Destination Calabria (Radio...)</div>
                        <small>Alex Gaudino</small>
                    </div>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Substitution (feat. Julian Perretta)</div>
                        <small>Purple Disco Machine</small>
                    </div>
                </ListGroup.Item>
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Regarde-moi</div>
                        <small>Kungs</small>
                    </div>
                </ListGroup.Item>
            </ListGroup>

            {/* Pop Section */}
            <h5 className="mt-4">Pop</h5>
            <ListGroup variant="flush">
                <ListGroup.Item style={{ backgroundColor: '#1a1a1a', color: 'white' }} className="d-flex align-items-center">
                    <Image src="https://via.placeholder.com/50" rounded className="me-3" />
                    <div>
                        <div>Irish Pub Song</div>
                        <small>The High Kings</small>
                    </div>
                </ListGroup.Item>
            </ListGroup>
        </>
    );
}