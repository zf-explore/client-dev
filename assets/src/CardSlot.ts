import { _decorator, Component, Node, Prefab, instantiate, math, Quat, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CardSlot')
export class CardSlot extends Component {
    @property(Prefab)
    pfb_card: Prefab | null = null;

    private card: Node = null;

    start() {
        this.loadCards();

        (window as any)['kk'] = this;

        this.card = this.node.getChildByName('Card');
    }

    loadCards() {
        let count = 5;
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
}
