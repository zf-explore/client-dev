export class BigNumber {
    private _value: number[] = [0];

    constructor(val?: number | string) {
        if (val == null) {
            val = 0;
        }
        if (typeof val == 'number') {
            val = val.toString();
        }

        if (!/^\d{1,}/.test(val)) {
            throw "不合规的值, 仅支持正整形数值";
        }

        let arr = [];
        for (let i = val.length - 1; i >= 0; i--) {
            arr.push(parseInt(val[i]));
        }
        this._value = arr;
    }

    public add(tar: BigNumber | number) {
        if (typeof tar == 'number') {
            tar = new BigNumber(tar);
        }

        let al = this._value;
        let bl = tar._value;

        for (let i = 0; i < bl.length; i++) {
            let a = al[i];
            let b = bl[i];

            if (a > 0) {
                let n = a + b;
                al[i] = n % 10;
                if (n > 9) {
                    al[i + 1] = (al[i + 1] || 0) + 1;
                }
            } else {
                al[i] = b;
            }
        }
        return this.toString();
    }

    public sub(tar: BigNumber | number) {
        if (typeof tar == 'number') {
            tar = new BigNumber(tar);
        }

        let al = this._value;
        let bl = tar._value;
        let negative = false;
        
        if (al.length >= bl.length) {
            for (let i = 0; i < al.length; i++) {
                let a = al[i];
                let b = bl[i] || 0;
    
                if (a >= b) {
                    al[i] = a - b;
                } else {
                    al[i] = a + 10 - b;
                    if (al.length > i + 1) {
                        al[i + 1] -= 1;
                    } else {
                        negative = true;
                        break;
                    }
                }
            }
        } else {
            negative = true;
        }

        // 减成负数了
        if (negative) {
            al.length = 1;
            al[0] = 0;
        }

        // 去除高位的0
        for (let i = al.length - 1; i > 0; i--) {
            if (al[i] == 0) {
                al.splice(i, 1);
            } else {
                break;
            }
        }

        return this.toString();
    }

    public toString(): string {
        let arr = [];
        for (let i = 0; i < this._value.length; i++) {
            arr.unshift(this._value[i]);
        }
        return arr.join('');
    }

    public toFormat(): string {
        let result = '';
        let format = ['K', 'M', 'G', 'B', 'T', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ'];
        for (let n = format.length; n > 0; n--) {
            let v = n * 3;
            if (this._value.length > v) {
                let arr = [];
                for (let i = v; i < this._value.length; i++) {
                    arr.unshift(this._value[i]);
                }
                result = arr.join('') + format[n - 1];
                break;
            }
        }
        if (result.length == 0) {
            let arr = [];
            for (let i = 0; i < this._value.length; i++) {
                arr.unshift(this._value[i]);
            }
            result = arr.join('');
        }
        return result;
    }

    public static add(a: number, b: number) {
        let left = new BigNumber(a);
        let right = new BigNumber(b);
        left.add(right);

        console.log(a + b, left.toString(), (a + b).toString() == left.toString());
    }

    public static sub(a: number, b: number) {
        let left = new BigNumber(a);
        let right = new BigNumber(b);
        left.sub(right);

        console.log(a - b, left.toString(), (a - b).toString() == left.toString());
    }
}
