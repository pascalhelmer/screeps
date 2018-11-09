import Dictionary from "typescript-collections/dist/lib/Dictionary";


export class Storage {

    private static _memoryKey: string = 'Storage';

    private static _instance: Storage | undefined;
    public static instance(): Storage {
        if (!Storage._instance) {
            Storage._instance = new Storage();
        }

        return Storage._instance;
    }


    private _storage: Dictionary<string, any>;


    private constructor() {
        this.load();
    }

    private load(): void {
        this._storage = Object.assign(new Dictionary<string, any>(), Memory[Storage._memoryKey]);
    }

    public save(): void {
        Memory[Storage._memoryKey] = this._storage;
    }

    public set(key: string, obj: any): boolean {
        return this._storage.setValue(key, obj);
    }

    public get(key: string): any | undefined {
        if (this._storage.containsKey(key)) {
            return this._storage.getValue(key);
        }
        return undefined;
    }
}
