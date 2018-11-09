import Dictionary from "typescript-collections/dist/lib/Dictionary";
import PriorityQueue from "typescript-collections/dist/lib/PriorityQueue";
import { profile } from "../../../Profiler/Profiler";
import { Action } from "./Action";
import { QUEUETYPE } from "./QueueType.enum";

@profile
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
        this._storage = this.load();
    }

    private load(): Dictionary<string, Dictionary<number, PriorityQueue<Action>>> {
        // this._storage = Memory[QueueStorage._memoryKey];

        const storageDic: Dictionary<string, Dictionary<number, PriorityQueue<Action>>> = new Dictionary();
        for (const roomName in Game.rooms) {
            const queueDic: Dictionary<number, PriorityQueue<Action>> = new Dictionary();
            for (const queue in Object.values(QUEUETYPE)) {
                if (!isNaN) {
                    queueDic.setValue(Number(queue), Object.assign(new PriorityQueue(), Memory[QueueStorage._memoryKey][roomName][queue]));
                }
            }
            storageDic.setValue(roomName, Object.assign(new Dictionary<number, PriorityQueue<Action>>(), queueDic));
        }

        return storageDic;
    }

    public save(): void {
        Memory[QueueStorage._memoryKey] = this._storage;
    }

    public enqueue(roomid: string, queueid: QUEUETYPE, value: Action): boolean {
        if (!this._storage.containsKey(roomid)) {
            this._storage.setValue(roomid, new Dictionary<number, PriorityQueue<Action>>());
        }

        if (!this._storage.getValue(roomid)!.containsKey(queueid)) {
            this._storage.getValue(roomid)!.setValue(queueid, new PriorityQueue<Action>());
        }

        return this._storage.getValue(roomid)!.getValue(queueid)!.enqueue(value);
    }

    public peek(roomid: string, queueid: QUEUETYPE): Action | undefined {
        return this.dequeue(roomid, queueid, true);
    }

    public dequeue(roomid: string, queueid: QUEUETYPE, peek?: boolean): Action | undefined {
        if (this._storage.containsKey(roomid)) {
            if (this._storage.getValue(roomid)!.containsKey(queueid)) {
                if (peek) {
                    return this._storage.getValue(roomid)!.getValue(queueid)!.peek();
                } else {
                    return this._storage.getValue(roomid)!.getValue(queueid)!.dequeue();
                }
            }
        }
        return undefined;
    }
}
