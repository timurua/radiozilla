import { Badge } from 'react-bootstrap';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userDataStore } from '../state/userData';
import { observer } from "mobx-react-lite";

export const ChannelSubscribeButton = observer(({ channelId }: { channelId: string }) => {

    const isSubscribed = userDataStore.subscribedChannelIds.includes(channelId);

    const handleSubscribe = (e: React.MouseEvent<HTMLElement>) => {
        const newUserData = userDataStore.userData.clone();
        if (isSubscribed) {
            newUserData.subscribedChannelIds = newUserData.subscribedChannelIds.filter(id => id !== channelId);
        } else {
            newUserData.subscribedChannelIds = Array.from(new Set([...newUserData.subscribedChannelIds, channelId]));
        }
        userDataStore.setUserData(newUserData);
        e.stopPropagation();
    }

    return (
        <Badge onClick={(e) => handleSubscribe(e)} bg="secondary" className="ms-2 user-select-none">
            {isSubscribed ? "unsubscribe" : "subscribe"}
        </Badge>
    );
});