import { AudioStacker } from "../audio/AudioStacker";
import { AssetUtils } from "../support/utils/AssetUtils";

export class AudioManager {
    private _effectVolume: number = 1;
    private _musicVolume: number = 1;
    private _effectStacker: AudioStacker | null;
    private _musicStacker: AudioStacker | null;

    constructor() {
        this._effectStacker = null;
        this._musicStacker = null;
    }

    playEffect(filename: string, alone: boolean = true) {
        let stacker: AudioStacker;
        if (alone) {
            stacker = new AudioStacker();
            stacker.on('ended', stacker.dispose, stacker);
        } else {
            if (this._effectStacker == null) {
                this._effectStacker = new AudioStacker();
            } else {
                this._effectStacker.dispose();
            }
            stacker = this._effectStacker;
        }
        stacker.setVolume(this._effectVolume);
        stacker.addAudio(AssetUtils.getAudio(filename));
        stacker.play();
    }

    playMusic(filename: string, loop: boolean = true) {
        if (this._musicStacker == null) {
            this._musicStacker = new AudioStacker();
        } else {
            this._musicStacker.dispose();
        }
        this._musicStacker.setVolume(this._musicVolume);
        this._musicStacker.setLoop(loop);
        this._musicStacker.addAudio(AssetUtils.getAudio(filename));
        this._musicStacker.play();
    }

    stopMusic() {
        this._musicStacker?.dispose();
    }

    getEffectVolume(): number {
        return this._effectVolume;
    }
    setEffectVolume(value: number) {
        if (value == this._effectVolume) {
            return;
        }
        this._effectVolume = value;
        this._effectStacker?.setVolume(value);
    }

    getMusicVolume(): number {
        return this._musicVolume;
    }
    setMusicVolume(value: number) {
        if (value == this._musicVolume) {
            return;
        }
        this._musicVolume = value;
        this._musicStacker?.setVolume(value);
    }
}
