import { _decorator, Component, Node, AudioClip, resources, AudioSource } from 'cc';
import { Store } from '../core/Store';
const { ccclass, property } = _decorator;

@ccclass('Audio')
export class Audio extends Store {
    private _src: string;
    private _loop: boolean;
    private _playing: boolean;
    private _volume: number;
    private _source: AudioSource | null;

    constructor() {
        super();
        this._src = '';
        this._playing = false;
        this._volume = 1;
        this._loop = false;
        this._source = new AudioSource;
    }

    play() {
        // 未设置资源
        if (this._src == null || this._src == "") return;

        // 正在播放中
        if (this._playing) return;
        this._playing = true;

        let clip = resources.get(this._src, AudioClip);
        if (clip == null) {
            this.loadAudioClip();
        } else {
            this._source && (this._source.clip = clip);
            this._source?.play();
        }
    }

    dispose() {
        this._source?.stop();
        this._source = null;
        this._src = '';
        this._volume = 1;
        this._loop = false;
        this._playing = false;
        super.dispose();
    }

    private loadAudioClip() {
        resources.load(this._src, AudioClip, (err, clip) => {
            if (err != null) {
                console.error('Audio loadAudioClip: ' + err.message);
                return;
            }
            this._source && (this._source.clip = clip);
            this._source?.play();
        });
    }

    getSrc(): string {
        return this._src;
    }
    setSrc(value: string) {
        this._src = value;
    }

    getLoop(): boolean {
        return this._loop;
    }
    setLoop(value: boolean) {
        this._loop = value;
        this._source && (this._source.loop = value);
    }

    getVolume(): number {
        return this._volume;
    }
    setVolume(value: number) {
        this._volume = value;
        this._source && (this._source.volume = value);
    }

    getPlaying(): boolean {
        return this._playing;
    }
}
