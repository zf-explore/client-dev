export * from "./network/Connector";
export * from "./network/HTTP";
export * from "./network/HeartBeat";
export * from "./support/BigNumber";
export * from "./component/Joystick";

// 以下是框架模块内容 ################################

import { DEV } from "cc/env";
import { FRAME_VERSION } from "./core/Version";
import { AudioManager } from "./manager/AudioManager";

export module ideal {
    export const audio = new AudioManager;
}

export module ideal {
    export const version: string = FRAME_VERSION;
}

if (DEV) {
    (window as any)['ideal'] = ideal;
}
