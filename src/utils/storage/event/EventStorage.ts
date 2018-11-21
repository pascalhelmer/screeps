import { EVENTTYPE } from "./EventType.enum";


export class EventStorage {
    private static _instance: EventStorage;
    public static instance(): EventStorage {
        if (!EventStorage._instance) {
            EventStorage._instance = new EventStorage();
        }

        return EventStorage._instance;
    }

    private _events: string[];

    private constructor() {
        this._events = Memory.events || [];
    }

    public getEvents(roomName: string, type: EVENTTYPE, key: string, remove?: boolean): string[] {
        const result = _.intersection(this._events, [this.createKey(roomName, type, key)]);
        if (remove) {
            this.removeEvents(roomName, type, key);
        }
        return result;
    }

    public removeEvents(roomName: string, type: EVENTTYPE, key: string): void {
        this._events = _.difference(this._events, [this.createKey(roomName, type, key)]);
    }

    public addEvent(roomName: string, type: EVENTTYPE, key: string): void {
        this._events.push(this.createKey(roomName, type, key));
    }

    public save(): void {
        Memory.events = this._events;
    }

    private createKey(roomName: string, type: EVENTTYPE, key: string): string {
        return `${roomName}${type}${key}`;
    }
}
