export class Store {
    private _selector: Map<string, any[][]>;

    constructor() {
        this._selector = new Map;
    }

    on(cmd: string, selector: Function, thisObj: any) {
        let arr = this._selector.get(cmd) || [];
        arr.push([selector, thisObj]);
        this._selector.set(cmd, arr);
    }

    off(cmd: string, selector: Function, thisObj?: any) {
        let arr = this._selector.get(cmd) || [];
        for (let i = arr.length - 1; i >= 0; i--) {
            if (thisObj == null) {
                if (arr[i][0] == selector) {
                    arr.splice(i, 1);
                }
            } else {
                if (arr[i][0] == selector || arr[i][1] == thisObj) {
                    arr.splice(i, 1);
                }
            }
        }
        this._selector.set(cmd, arr);
    }

    emit(cmd: string, data?: any) {
        for (let k of this._selector.keys()) {
            if (k == cmd) {
                let arr = this._selector.get(k) || [];
                for (let i = 0; i < arr.length; i++) {
                    let func: Function = arr[i][0] as Function;
                    let thisObj: any = arr[i][1] as any;
                    if (data) {
                        func.apply(thisObj, [data]);
                    } else {
                        func.call(thisObj);
                    }
                }
                break;
            }
        }
    }

    reset() {

    }

    dispose() {

    }
}
