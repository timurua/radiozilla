import { Badge } from 'react-bootstrap';
import { RZChannel } from "../data/model";
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userDataState } from '../state/userData';

export function ChannelSubscribeButton({ channel }: { channel: RZChannel }) {

    const userData = useRecoilValue(userDataState);
    const setUserData = useSetRecoilState(userDataState);
    const isSubscribed = userData.subscribedChannelIds.includes(channel.id);

    const handleSubscribe = (channel: RZChannel, e: any) => {
        const newUserData = userData.clone();
        if (isSubscribed) {
            newUserData.subscribedChannelIds = newUserData.subscribedChannelIds.filter(id => id !== channel.id);            
        } else {
            newUserData.subscribedChannelIds.push(channel.id);            
        }        
        setUserData(newUserData);
        e.stopPropagation();        
    }

    return (
        <Badge onClick={(e) => handleSubscribe(channel, e)} bg="secondary" className="ms-2 user-select-none">
            {isSubscribed ? "unsubscribe" : "subscribe"}
        </Badge>
    );
}