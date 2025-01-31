import { Badge } from 'react-bootstrap';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userDataState } from '../state/userData';

export function ChannelSubscribeButton({ channelId }: { channelId: string }) {

    const userData = useRecoilValue(userDataState);
    const setUserData = useSetRecoilState(userDataState);
    const isSubscribed = userData.subscribedChannelIds.includes(channelId);

    const handleSubscribe = (e: any) => {
        const newUserData = userData.clone();
        if (isSubscribed) {
            newUserData.subscribedChannelIds = newUserData.subscribedChannelIds.filter(id => id !== channelId);            
        } else {
            newUserData.subscribedChannelIds = Array.from(new Set([...newUserData.subscribedChannelIds, channelId]));            
        }        
        setUserData(newUserData);
        e.stopPropagation();        
    }

    return (
        <Badge onClick={(e) => handleSubscribe(e)} bg="secondary" className="ms-2 user-select-none">
            {isSubscribed ? "unsubscribe" : "subscribe"}
        </Badge>
    );
}