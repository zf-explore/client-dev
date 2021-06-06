import { Connector } from "./Connector";

const HB_CMD = "1";
const BEAT_TIME = 3 * 1000; // 心跳间隔时间, 秒
const AUTO_BREAK_TIME = 10 * 1000; // 自动终止间隔时间, 秒

export class HeartBeat {
    private _conn: Connector;
    private _stidBeat!: number;
    private _stidBreak!: number;

    constructor(conn: Connector) {
        this._conn = conn;
        this._conn.on(HB_CMD, this.recvBeat, this);
    }

    dispose() {
        this._conn.off(HB_CMD, this.recvBeat, this);
    }

    start() {
        this.reset();
    }

    stop() {
        clearTimeout(this._stidBeat);
        clearTimeout(this._stidBreak);
    }

    reset() {
        clearTimeout(this._stidBeat);
        this._stidBeat = setTimeout(() => {
            this.sendBeat();
        }, BEAT_TIME);

        clearTimeout(this._stidBreak);
        this._stidBreak = setTimeout(() => {
            this._conn.socket?.close();
            this.stop();
        }, AUTO_BREAK_TIME);
    }

    sendBeat() {
        this._conn.send(HB_CMD);
    }

    recvBeat() {
        this.reset();

        console.log(`${this._conn.cid}: du ~`);
    }
}
