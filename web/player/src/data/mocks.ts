import { User } from "./model";

export const Users = {
    getCurrent: async () => {
        // Simulate an asynchronous operation (e.g., fetching from a database)
        return new Promise<User>((resolve) => {
            Promise.resolve().then(() => {
                resolve(new User("timurua@gmail.com ", "John Doe", ["Music", "Technology"]));
            })
        });
    }
};