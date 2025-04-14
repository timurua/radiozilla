/**
 * User class that represents the current user state
 */
export class ASUser {
    constructor(
        public id: string,
        public name: string,
        public imageUrl: string,
        public email: string,
        public isAuthenticated: boolean,
    ) {
    }
}
