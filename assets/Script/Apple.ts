const {ccclass, property} = cc._decorator;
import { Game } from "./Game";
import {GameData} from "./GameData";

@ccclass
export default class NewClass extends cc.Component {
    first = true;
    radian = 0;
    circleCenter = GameData.gd.CircleCenter;
    circleRadius = 0;
    angle = 0;
    Speed = 0;
    public game: Game = null;
    public moveR = 0;
    @property
    pickRadius = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.schedule(this.circleMove, 0.01);
    }

    public init(game:Game) {
        this.game = game;
        this.circleRadius = Math.abs(this.game.ground.y-this.game.player.getComponent("Player").selfHight);
    }

    public circleMove(dt: number)
    {
        this.angle += dt * this.Speed;
        //this.radian += dt * (this.Speed/100);
        var radian = (this.angle)*0.017453293
        let x = this.moveR * Math.cos(radian) + this.circleCenter.x; 
        let y = this.moveR * Math.sin(radian) + this.circleCenter.y;
        this.node.position = cc.v2(x, y);
    }

    public getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    }

    start () {

    }

    update (dt: any) {
        if (this.getPlayerDistance() < this.pickRadius) {
            //消除一个毒蘑菇
            this.game.delmushroom();
            this.node.destroy();
            return;
        }
    }
}
