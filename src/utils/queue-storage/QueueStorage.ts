import Dictionary from "typescript-collections/dist/lib/Dictionary";
import PriorityQueue from "typescript-collections/dist/lib/PriorityQueue";

import { Action } from "./Action";
import { QUEUETYPE } from "./QueueType.enum";


export class QueueStorage {

    private static _memoryKey: string = 'QueueStorage';

    private static _instance: QueueStorage | undefined;
    public static instance(): QueueStorage {
        if (!QueueStorage._instance) {
            QueueStorage._instance = new QueueStorage();
        }

        return QueueStorage._instance;
    }


    private _storage: Dictionary<string, Dictionary<number, PriorityQueue<Action>>>;


    private constructor() {
        this.load();
    }

    private load(): void {
        // this._storage = Memory[QueueStorage._memoryKey];

        const storageDic: Dictionary<string, Dictionary<number, PriorityQueue<Action>>> = new Dictionary();
        for (const room in Game.rooms) {
            const queueDic: Dictionary<number, PriorityQueue<Action>> = new Dictionary();
            for (const queue in QUEUETYPE) {
                queueDic.setValue(queue, Object.assign(new PriorityQueue(), Memory[QueueStorage._memoryKey][room.name][queue]));
            }
            storageDic.setValue(room.name, Object.assign(new Dictionary<number, PriorityQueue<Action>>(), queueDic));
        }

        this._storage = storageDic;
    }

    public save(): void {
        Memory[QueueStorage._memoryKey] = this._storage;
    }

    public enqueue(roomid: string, queueid: QUEUETYPE, value: Action): boolean {
        if (!this._storage.containsKey(roomid)) {
            this._storage.setValue(roomid, new Dictionary<number, PriorityQueue<Action>>());
        }

        if (!this._storage.getValue(roomid).containsKey(queueid)) {
            this._storage.getValue(roomid).setValue(queueid, new PriorityQueue<Action>());
        }

        return this._storage.getValue(roomid).getValue(queueid).enqueue(value);
    }

    public peek(roomid: string, queueid: QUEUETYPE): Action | undefined {
        return this.dequeue(roomid, queueid, true);
    }

    public dequeue(roomid: string, queueid: QUEUETYPE, peek?: boolean): Action | undefined {
        if (this._storage.containsKey(roomid)) {
            if (this._storage.getValue(roomid).containsKey(queueid)) {
                if (peek) {
                    return this._storage.getValue(roomid).getValue(queueid).peek();
                } else {
                    return this._storage.getValue(roomid).getValue(queueid).dequeue();
                }
            }
        }
        return undefined;
    }
}
