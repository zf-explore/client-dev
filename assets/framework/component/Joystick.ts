import { _decorator, Component, Node, Vec2, Vec3, UITransform, EventTouch, v2, v3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    private rocker: Node | null = null;

    private maxRadius = 40;
    private _temp_v2: Vec2 = new Vec2;
    private _temp_v3: Vec3 = new Vec3;
    private _direction: Vec3 = new Vec3;
    private _magnitude: number = 0;
    private _rotation: number = 0;

    onEnable() {
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchMove(ev: EventTouch): void {
        ev.getUILocation(this._temp_v2);

        this.node.getWorldPosition(this._temp_v3);
        this._temp_v3.x = this._temp_v2.x - this._temp_v3.x;
        this._temp_v3.y = this._temp_v2.y - this._temp_v3.y;
        this._temp_v3.z = 0;

        this._direction.set(this._temp_v3);
        this._direction.normalize();

        let distance = Vec3.distance(this._temp_v3, Vec3.ZERO);
        if (distance >= this.maxRadius) {
            distance = this.maxRadius;
        }

        this._magnitude = distance / this.maxRadius;
        Vec3.multiplyScalar(this._temp_v3, this._direction, distance);

        this._rotation = -Math.atan2(this._direction.x, this._direction.y) * (180.0 / Math.PI);
        this.rocker?.setPosition(this._temp_v3);
    }

    private _onTouchMove(ev: EventTouch): void {
        // ev.getUILocation(this._temp_v2);
        // this._temp_v3.set(this._temp_v2.x, this._temp_v2.y);
        // this.node.getComponent(UITransform)?.convertToNodeSpaceAR(this._temp_v3, this._temp_v3);

        // let pos = this._temp_v3;
        // let len = pos?.length();
        // if (len > this.maxRadius) {
        //     pos.x = this.maxRadius * pos.x / len;
        //     pos.y = this.maxRadius * pos.y / len;
        // }
        
        // this._moving = true;
        // this.rocker?.setPosition(pos);
        // this._magnitude = Math.min(len / this.maxRadius, 1);
        // this._direction = v2().subtract2f(pos.x, pos.y).normalize().negative();
    }

    private onTouchEnd(ev: EventTouch): void {
        this._magnitude = 0;
        this._rotation = 0;
        this._direction.set(Vec3.ZERO);
        this.rocker?.setPosition(Vec3.ZERO);
    }

    public get direction(): Vec3 {
        return this._direction;
    }

    /**
     * 摇杆力度, 返回0~1之间的值
     */
    public get magnitude(): number {
        return this._magnitude;
    }

    public get rotation(): number {
        return this._rotation;
    }
}
