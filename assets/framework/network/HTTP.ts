export class HTTP {
    private static _token: string | null;
    private static _timeout: number = 10000;

    public static Get(url: string, params?: any, callback?: (err: Error | null, data: any) => void) {
        if (this._token != null) {
            if (params == null) {
                params = { 'token': this._token };
            } else {
                params['token'] = this._token;
            }
        }
        if (params != null && typeof params == 'object') {
            for (let key in params) {
                let val = encodeURIComponent(params[key]);
                if (/\?/g.test(url)) {
                    let reg = new RegExp('[?|&]' + key + '=([^&]*)', 'g');
                    let res = reg.exec(url);
                    if (res) {
                        url = url.substr(0, res.index) + res[0].replace(res[1], val) + url.substr(res.index + res[0].length);
                    } else {
                        url += `&${key}=${val}`;
                    }
                } else {
                    url += `?${key}=${val}`;
                }
            }
        }

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = this._timeout;
        xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhr.onreadystatechange = () => this.doReadyStateChange(xhr, callback);
        xhr.send();
    }

    public static Post(url: string, params?: any, callback?: (err: Error | null, data: any) => void) {
        if (this._token != null) {
            if (params == null) {
                params = { 'token': this._token };
            } else {
                params['token'] = this._token;
            }
        }
        if (params != null && typeof params == 'object') {
            for (let key in params) {
                params[key] = encodeURIComponent(params[key]);
            }
        }

        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.timeout = this._timeout;
        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.onreadystatechange = () => this.doReadyStateChange(xhr, callback);
        if (params != null && typeof params == 'object') {
            xhr.send(JSON.stringify(params));
        } else {
            xhr.send();
        }
    }

    private static doReadyStateChange(xhr: XMLHttpRequest, callback?: (err: Error | null, data: any) => void) {
        if (xhr.readyState != 4) {
            return;
        }

        let data = null;
        try {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (err) {
                    throw err;
                }
            } else {
                throw new Error('请求失败, 错误码: ' + xhr.status);
            }
        } catch (err) {
            callback && callback(err, null);
            return;
        }
        callback && callback(null, data);
    }

    public static get Token(): string | null {
        return this._token;
    }

    public static set Token(value: string | null) {
        this._token = value;
    }
}
