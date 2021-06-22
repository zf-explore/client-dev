import { _decorator, Component, Prefab, instantiate, Quat, Label, EventTouch, tween, Vec2, Vec3, Node, UITransform, v3 } from 'cc';
import { Card } from './Card';
const { ccclass, property } = _decorator;

// 卡组的半径
const CARD_GROUP_RADIUS = 1100;
// 卡组的扇形角度
const CARD_GROUP_ANGLE = 26;
// 卡组的扇形角度完整排序单位数量
const CARD_GROUP_FULLANGLE_SORTNUM = 6;
// 卡组的溢出像素
const CARD_GROUP_OVERFLOW = (180 - CARD_GROUP_ANGLE) / 2;

const temp_v2 = new Vec2();
const temp_v3 = new Vec3();
const temp_quat = new Quat();

@ccclass('CardControl')
export class CardControl extends Component {
    @property(Prefab)
    pfb_card: Prefab | null = null;

    @property(Node)
    node_birth: Node | null = null;

    private angle: number = 0;
    private overflow: number = 0;
    private gap: number = 0;
    private cards: Card[] = [];
    private sorting: boolean = false;
    private sortnum: number = 0;

    start() {
        // this.loadCards();

        (window as any)['kk'] = this;
    }

    loadCards() {
        let count = 3;
        let jiao = 26;
        let angle = jiao / (count - 1);
        let gap = (180 - jiao) / 2;
        let radius = 1000;

        for (let i = 0; i < count; i++) {
            let n = jiao - angle * i + gap;
            let x = Math.cos(n * Math.PI / 180) * radius;
            let y = Math.sin(n * Math.PI / 180) * radius - (radius - 30);
            let z = 0;

            let card = instantiate(this.pfb_card);
            card.setPosition(x, y, z);

            let a = jiao - i * angle * 2;
            let r = new Quat();
            Quat.fromEuler(r, 0, 0, a);
            card.setRotation(r);

            card.getChildByName('Label').getComponent(Label).string = a.toFixed(2).toString();

            this.node.addChild(card);
        }
    }

    onAddCard(ev: EventTouch, flag: string) {
        let count = parseInt(flag) || 1;
        for (let i = 0; i < count; i++) this.addCard();
    }

    addCard() {
        let node = instantiate(this.pfb_card);
        node.parent = this.node;
        this.cards.push(node.getComponent(Card));

        this.node_birth.getWorldPosition(temp_v3);
        node.setWorldPosition(temp_v3);

        let uiCard = node.getComponent(UITransform);
        let uiBirth = this.node_birth.getComponent(UITransform);
        node.setScale(uiBirth.width / uiCard.width, uiBirth.height / uiCard.height);
    }

    removeCard(node: Node) {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].node == node) {
                this.cards.splice(i, 1);
                node.removeFromParent();
                break;
            }
        }
    }

    update(dt: number) {
        if (this.sortnum != this.cards.length && !this.sorting) {
            this.sorting = true;
            this.sortnum = this.cards.length;
            this.autoSort();
        }
    }

    autoSort() {
        let arate = (Math.min(this.sortnum, CARD_GROUP_FULLANGLE_SORTNUM) / CARD_GROUP_FULLANGLE_SORTNUM);
        this.angle = CARD_GROUP_ANGLE * arate;
        this.gap = this.angle / (this.sortnum - 1);
        this.overflow = (180 - this.angle) / 2;

        for (let i = 0; i < this.sortnum; i++) {
            let card = this.cards[i];
            if (card) {
                tween(card.node).to(0.2, {
                    position: this.calcPositionByIndex(i),
                    rotation: this.calcRotationByIndex(i),
                    scale: v3(1, 1, 1),
                }).call(() => card.relocation()).start();
            } else {
                break;
            }
        }

        this.scheduleOnce(() => {
            this.sorting = false;
        }, 0.2);
    }

    calcPositionByIndex(index: number): Vec3 {
        if (index >= this.sortnum) {
            return null;
        }
        
        let n, x, y = 0;
        let p = new Vec3();

        switch (this.sortnum) {
            case 1:
                x = Math.cos(90 * Math.PI / 180) * CARD_GROUP_RADIUS;
                y = Math.sin(90 * Math.PI / 180) * CARD_GROUP_RADIUS - CARD_GROUP_RADIUS + 35;
                p.set(x, y, 0);
                break;
            default:
                n = this.angle - this.gap * index + this.overflow;
                x = Math.cos(n * Math.PI / 180) * CARD_GROUP_RADIUS;
                y = Math.sin(n * Math.PI / 180) * CARD_GROUP_RADIUS - CARD_GROUP_RADIUS + 35;
                p.set(x, y, 0);
                break;
        }
        return p;
    }

    calcRotationByIndex(index: number): Quat {
        if (index >= this.sortnum) {
            return null;
        }

        let a = 0;
        let r = new Quat();

        switch (this.sortnum) {
            case 1:
                break;
            default:
                a = this.angle - index * this.gap * 2;
                Quat.fromEuler(r, 0, 0, a);
                break;
        }
        return r;
    }
}
