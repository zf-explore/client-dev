import { _decorator, Component, Node, EventTouch, tween, v3, Tween, Vec3, Vec2, UITransform, quat, Quat } from 'cc';
const { ccclass, property } = _decorator;

const temp_v2 = new Vec2;
const temp_v3 = new Vec3;

@ccclass('Card')
export class Card extends Component {
    private draging: boolean = false;
    private tween: Tween<Node> = null;
    private originPosition: Vec3 = new Vec3;
    private originRotation: Quat = new Quat;
    private originSiblingIndex: number = 0;

    onEnable() {
        this.node.getPosition(this.originPosition);
        this.node.getRotation(this.originRotation);
        this.originSiblingIndex = this.node.getSiblingIndex();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart() {
        this.stopTween();
        this.tween = new Tween(this.node);
        this.tween.to(0.18, {
            position: v3(0, 380, 0),
            scale: v3(1.8, 1.8, 1),
            rotation: quat(0, 0, 0, 1),
        });
        this.tween.start();
        this.draging = false;
        this.node.setSiblingIndex(100);
    }

    onTouchMove(ev: EventTouch) {
        let cardSlot = this.node.parent;
        let uiCardSlot = cardSlot.getComponent(UITransform);

        ev.getUILocation(temp_v2);

        cardSlot.getWorldPosition(temp_v3);
        temp_v3.x = temp_v2.x - temp_v3.x;
        temp_v3.y = temp_v2.y - temp_v3.y;
        temp_v3.z = 0;

        if (!this.draging && temp_v3.y > uiCardSlot.height / 2) {
            this.draging = true;
            this.stopTween();
            this.tween = new Tween(this.node);
            this.tween.to(0.1, {
                scale: v3(1, 1, 1),
                rotation: quat(0, 0, 0, 1),
            });
            this.tween.start();
        }

        if (this.draging) {
            this.node.setPosition(temp_v3);
        }
    }

    onTouchEnd() {
        this.stopTween();
        this.node.setScale(1, 1, 1);
        this.node.setPosition(this.originPosition);
        this.node.setRotation(this.originRotation);
        this.draging = false;
        this.node.setSiblingIndex(this.originSiblingIndex);
    }

    stopTween() {
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }

    relocation() {
        this.node.getPosition(this.originPosition);
        this.node.getRotation(this.originRotation);
    }
}
