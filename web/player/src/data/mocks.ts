import { User, Playable, PlaybackStatus, RedinessStatus, SourceType } from "./model";

export const Users = {
    getCurrent: async () => {
        // Simulate an asynchronous operation (e.g., fetching from a database)
        return new Promise<User>((resolve) => {
            Promise.resolve().then(() => {
                resolve(new User("timurua@gmail.com ", "John Doe", ["Music", "Technology"]));
            })
        });
    }
}

function getDateWithOffset(daysOffset: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - daysOffset);
    return date;
}

export const Playables = {
    list: async (userEmail: string) => {
        // Simulate an asynchronous operation (e.g., fetching from a database)
        return new Promise<Playable[]>((resolve) => {
            Promise.resolve().then(() => {
                resolve([
                    new Playable(
                        "1",
                        getDateWithOffset(0),
                        "music - 1",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2021/11/04/05/33/dome-6767422_960_720.jpg",
                        "https://cdn.pixabay.com/audio/2022/08/23/audio_d16737dc28.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Technology"],
                        SourceType.Audio,),
                    new Playable(
                        "2",
                        getDateWithOffset(0),
                        "music - 2",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2021/09/06/16/45/nature-6602056__340.jpg",
                        "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Technology"],
                        SourceType.Audio,),
                    new Playable(
                        "3",
                        getDateWithOffset(1),
                        "music - 3",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2022/08/29/08/47/sky-7418364__340.jpg",
                        "https://cdn.pixabay.com/audio/2022/08/03/audio_54ca0ffa52.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Music"],
                        SourceType.Audio,),
                    new Playable(
                        "4",
                        getDateWithOffset(1),
                        "music - 1",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2015/09/22/01/30/lights-951000__340.jpg",
                        "https://cdn.pixabay.com/audio/2022/07/25/audio_3266b47d61.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Music"],
                        SourceType.Audio,),
                    new Playable(
                        "5",
                        getDateWithOffset(7),
                        "music - 1",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2022/08/28/18/03/dog-7417233__340.jpg",
                        "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Technology"],
                        SourceType.Audio,),
                    new Playable(
                        "6",
                        getDateWithOffset(1),
                        "music - 1",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2015/09/22/01/30/lights-951000__340.jpg",
                        "https://cdn.pixabay.com/audio/2022/07/25/audio_3266b47d61.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Music"],
                        SourceType.Audio,),
                    new Playable(
                        "7",
                        getDateWithOffset(7),
                        "music - 1",
                        "react-modern-audio-player",
                        "https://cdn.pixabay.com/photo/2022/08/28/18/03/dog-7417233__340.jpg",
                        "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
                        PlaybackStatus.Idle,
                        RedinessStatus.Ready,
                        ["Technology"],
                        SourceType.Audio,),

                ]);
            }); // Simulate a 1 second delay
        });
    }
}
