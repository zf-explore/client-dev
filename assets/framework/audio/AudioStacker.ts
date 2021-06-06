import { Store } from "../core/Store";
import { Audio } from "./Audio";

export class AudioStacker extends Store {
    private _loop: boolean;
    private _playing: boolean;
    private _audios: string[];
    private _volume: number;
    private _currAudio: Audio | null;

    constructor() {
        super();
        this._loop = false;
        this._currAudio = null;
        this._audios = [];
        this._volume = 1;
        this._playing = false;
    }

    addAudio(audioName: string) {
        this._audios.push(audioName);
    }

    play() {
        if (this._playing) return;
        this._playing = true;
        this.next();
    }

    dispose() {
        this._playing = false;
        this._currAudio?.dispose();
        this._currAudio = null;
        this._audios.length = 0;
        this._loop = false;
    }

    private next() {
        let src = this._audios.shift();
        if (src == null) {
            this.emit('ended');
            this.dispose();
        } else {
            this._currAudio?.dispose();
            this._currAudio = new Audio();
            this._currAudio.setVolume(this._volume);
            this._currAudio.setSrc(src);
            this._currAudio.on('ended', this.next, this);
            this._currAudio.play();
            this._loop && this._audios.push(src);
        }
    }

    getLoop(): boolean {
        return this._loop;
    }
    setLoop(value: boolean) {
        this._loop = value;
    }

    getVolume(): number {
        return this._volume;
    }
    setVolume(value: number) {
        this._volume = value;
    }

    getPlaying(): boolean {
        return this._playing;
    }
}
