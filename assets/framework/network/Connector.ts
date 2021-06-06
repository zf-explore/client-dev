import { DEV } from 'cc/env';
import { Store } from "../core/Store";
import { HeartBeat } from './HeartBeat';

/**
 * 上发数据格式:
 * {
 *  cmd: 1001,
 *  params: {},
 * }
 * 下发数据格式:
 * {
 *  cmd: 1001,
 *  code: 0,
 *  data: {},
 * }
 */


export enum MessageType {
    Json = 1,
    Protobuff = 2,
    BinaryBuff = 3,
}

export enum ConnectorState {
    Idle = 0, // 空闲
    Connecting = 1, // 连接中
    Connected = 2, // 已连接
    Disconnecting = 3, // 正在断开
    Reconnecting = 4, // 正在重连
}

export enum ConnectorEvent {
    Connected = 'connected', // 连接成功时
    Reconnected = 'reconnected', // 重连成功时
    Disconnected = 'disconnected', // 断开连接时
}

export const URL_PREFIX = 'ws://';
const ConnArr: Connector[] = [];

export class Connector extends Store {
    private _cid: number;
    private _connected: boolean;
    private _url: string;
    private _state: number;
    private _messageType: number;
    private _socket: WebSocket | null;
    private _heartBeat: HeartBeat | null;
    private _networkDelay: number;
    private _messageQueue: Map<string, number[]>;

    constructor() {
        super();
        this._cid = Date.now();
        this._url = '';
        this._socket = null;
        this._heartBeat = null;
        this._state = ConnectorState.Idle;
        this._messageType = MessageType.Json;
        this._connected = false;
        this._networkDelay = 0;
        this._messageQueue = new Map;
        ConnArr.push(this);

        if (DEV) {
            (window as any)['Connector'] = Connector;
        }
    }

    connect(url: string) {
        if (url.startsWith(URL_PREFIX)) {
            this._url = url;
        } else {
            this._url = URL_PREFIX + url;
        }
        this._state = ConnectorState.Connecting;
        this._socket = null;
        this.newSocket();
    }

    disconnect() {
        if (this._state == ConnectorState.Idle || this._socket == null) return;

        this._state = ConnectorState.Disconnecting;
        this._socket.onclose = () => {
            this._socket = null;
            this._state = ConnectorState.Idle;
            this.emit(ConnectorEvent.Disconnected);
            this._heartBeat?.stop();
            this._heartBeat = null;
        };
        this._socket.close();
    }

    dispose() {
        super.dispose();
        this._socket?.close();
        ConnArr.splice(ConnArr.indexOf(this), 1);
    }

    send(cmd: string, params?: any) {
        switch (this._messageType) {
            case MessageType.Json:
                this.handleSend_Json(cmd, params);
                break;
            case MessageType.Protobuff:
                this.handleSend_Protobuff(cmd, params);
                break;
            case MessageType.BinaryBuff:
                this.handleSend_BinaryBuff(cmd, params);
                break;
        }
    }

    private reconnect() {
        this._state = ConnectorState.Reconnecting;
        this._socket = null;

        this._heartBeat?.stop();
        this._heartBeat = null;
        this.newSocket();
    }

    private newSocket() {
        try {
            this._socket = new WebSocket(this.url);
            if (this._messageType == MessageType.BinaryBuff) {
                this._socket.binaryType = 'arraybuffer';
            }
            this._socket.onopen = () => {
                this.handleOpen();
            };
            this._socket.onclose = () => {
                this.handleClose();
            };
            this._socket.onerror = (ev: Event) => {
                this.handleError(ev);
            };
            this._socket.onmessage = (ev: MessageEvent) => {
                this._heartBeat?.reset();
                switch (this._messageType) {
                    case MessageType.Json:
                        this.handleMessage_Json(ev);
                        break;
                    case MessageType.Protobuff:
                        this.handleMessage_Protobuff(ev);
                        break;
                    case MessageType.BinaryBuff:
                        this.handleMessage_BinaryBuff(ev);
                        break;
                }
            };
        } catch (err) {
            console.error(err);
        }
    }

    private handleOpen() {
        this._connected = true;

        // 正常连接
        if (this._state == ConnectorState.Connecting) {
            this.emit(ConnectorEvent.Connected);
        }
        // 二次重连
        else if (this._state == ConnectorState.Reconnecting) {
            this.emit(ConnectorEvent.Reconnected);
        }

        this._state = ConnectorState.Connected;

        this._heartBeat = new HeartBeat(this);
        this._heartBeat.start();
    }

    private handleClose() {
        // switch (this._socket?.readyState) {
        //     case WebSocket.OPEN:
        //     case WebSocket.CONNECTING:
        //         this._socket.close();
        //         break;
        //     case WebSocket.CLOSED:
        //         break;
        // }

        this.reconnect();
    }

    private handleError(ev: Event) {
        this.error(JSON.stringify(ev));
    }

    private handleSend_Json(cmd: string, params: any) {
        let data: any = {};
        data['cmd'] = cmd;
        params && (data['params'] = params);

        this._socket?.send(JSON.stringify(data));
        this.fromMessageQueue(cmd);
    }

    private handleSend_Protobuff(cmd: string, params: any) {
        this._socket?.send(JSON.stringify({
            cmd: cmd,
            params: params,
        }));
        this.fromMessageQueue(cmd);
    }

    private handleSend_BinaryBuff(cmd: string, params: any) {
        let data: any = {};
        data['cmd'] = cmd;
        params && (data['params'] = params);

        let encoder = new TextEncoder();
        let jsonBody = encoder.encode(JSON.stringify(data));
        let buffers = new ArrayBuffer(jsonBody.length + 4);

        let view = new DataView(buffers);
        view.setUint16(0, jsonBody.length, true);
        for (let i = 0; i < jsonBody.length; i++) {
            view.setUint8(i + 4, jsonBody[i]);
        }

        this._socket?.send(buffers);
        this.fromMessageQueue(cmd);
    }

    private handleMessage_Json(ev: MessageEvent) {
        let data!: {
            cmd: string,
            data: any,
        };

        try {
            data = JSON.parse(ev.data);
        } catch (err) {
            this.error('数据格式异常');
        }
        this.toMessageQueue(data.cmd);
        this.emit(data.cmd.toString(), data.data);
        // console.log(`cmd: ${data.cmd}, data: ${JSON.stringify(data.data)}`);
    }

    private handleMessage_Protobuff(ev: MessageEvent) {
        console.log('handleMessage', ev.data);
        // this.toMessageQueue(ev.cmd);
    }

    private handleMessage_BinaryBuff(ev: MessageEvent) {
        let data!: {
            cmd: string,
            data: any,
        };

        try {
            let decoder = new TextDecoder('utf8');
            let jsonStr = decoder.decode(ev.data, { stream: true });
            data = JSON.parse(jsonStr);
        } catch (err) {
            this.error('数据格式异常');
        }
        this.toMessageQueue(data.cmd);
        this.emit(data.cmd.toString(), data.data);
        // console.log(`cmd: ${data.cmd}, data: ${JSON.stringify(data.data)}`);
    }

    private error(title: string) {
        console.error(new Error('Connector Error => ' + title));
    }

    private fromMessageQueue(cmd: string) {
        let nowtime = Date.now();
        let arr = this._messageQueue.get(cmd) || [];
        arr.push(nowtime);
        this._messageQueue.set(cmd, arr);
    }

    private toMessageQueue(cmd: string) {
        let nowtime = Date.now();
        let arr = this._messageQueue.get(cmd) || [];
        let oldtime = arr.shift();

        if (oldtime && oldtime > 0) {
            this._networkDelay = nowtime - oldtime;
        }

        if (arr.length == 0) {
            this._messageQueue.delete(cmd);
        }
    }

    get cid(): number {
        return this._cid;
    }

    get url(): string {
        return this._url;
    }

    get messageType(): number {
        return this._messageType;
    }
    set messageType(value: number) {
        this._messageType = value;
    }

    get state(): number {
        return this._state;
    }

    get socket(): WebSocket | null {
        return this._socket;
    }

    /**
     * 网络延迟(毫秒)
     */
    get networkDelay(): number {
        return this._networkDelay;
    }

    static releaseAll() {
        for (let i = ConnArr.length - 1; i >= 0; i--) {
            ConnArr[i].dispose();
        }
    }
}
