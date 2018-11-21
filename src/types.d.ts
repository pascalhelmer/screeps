// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
    [name: string]: any;
}

interface RoomMemory {
    [name: string]: any;
}

interface SpawnMemory {
    [name: string]: any;
}

interface Memory {
    uuid: number;
    log: any;
    [name: string]: any;
}

// `global` extension samples
declare namespace NodeJS {
    interface Global {
        log: any;
        Profiler: any;
    }
}
