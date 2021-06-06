const ROOT_AUDIO: string = 'audios/';
const ROOT_PREFAB: string = 'prefabs/';
const ROOT_TEXTURE: string = 'textures/';
const ROOT_FONT: string = 'fonts/';
const ROOT_DRAGONBONE: string = 'dragonbones/';
const ROOT_ANIMATION: string = 'anims/';

export module AssetUtils {
    export function getAudio(audioName: string): string {
        return ROOT_AUDIO + audioName;
    }

    export function getPrefab(prefabName: string): string {
        if (prefabName.indexOf(ROOT_PREFAB) == 0) {
            return prefabName;
        }
        return ROOT_PREFAB + prefabName
    }

    export function getTexture(textureName: string): string {
        return ROOT_TEXTURE + textureName;
    }

    export function getFont(fontName: string): string {
        return ROOT_FONT + fontName;
    }

    export function getAnimationPath(animationName: string): string {
        return ROOT_ANIMATION + animationName;
    }

    export function getDragonBone(dragonBoneName: string): { name: string, ske: string, tex: string, img: string } {
        return {
            name: ROOT_DRAGONBONE + dragonBoneName,
            ske: ROOT_DRAGONBONE + dragonBoneName + "_ske",
            tex: ROOT_DRAGONBONE + dragonBoneName + "_tex",
            img: ROOT_DRAGONBONE + dragonBoneName + "_tex"
        };
    }
}
