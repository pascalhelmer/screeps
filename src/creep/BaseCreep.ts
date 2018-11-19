import { CREEP_STATE } from "./CreepState.enum";


export class BaseCreep {

    public static pauseRange: number = 3;

    protected _creep: Creep;
    protected _state: CREEP_STATE;
    protected _pause: RoomPosition;

    constructor(creep: Creep) {
        this._creep = creep;
        this._pause = new RoomPosition(0, 0, '');
        this._state = CREEP_STATE.WORK;
    }

    public update(): void {
        switch (this._state) {
            case CREEP_STATE.WORK:
                this.onWork();
                break;

            case CREEP_STATE.PAUSE:
                this.onPause();
                break;
        }
    }

    protected onWork(): void {
        // Have to be overridden
    };

    protected onPause(): void {
        if (!this._creep.pos.inRangeTo(this._pause, BaseCreep.pauseRange)) {
            this._creep.moveTo(this._pause);
        } else {
            this.stop();
        }
    }

    public work(): void {
        this._state = CREEP_STATE.WORK;
    }

    public pause(position: RoomPosition): void {
        this._state = CREEP_STATE.PAUSE;
        this._pause = position;
    }

    public stop(): void {
        this._state = CREEP_STATE.STOP;
    }
}
