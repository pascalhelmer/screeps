import { ACTIONPRIO } from "./ActionPrio.enum";
import { ACTIONTYPE } from "./ActionType.enum";


export class Action {
    public prio: ACTIONPRIO;
    public type: ACTIONTYPE;
    public payload: object;

    constructor(prio: ACTIONPRIO, type: ACTIONTYPE, payload: object) {
        this.prio = prio;
        this.type = type;
        this.payload = payload;
    }
}
