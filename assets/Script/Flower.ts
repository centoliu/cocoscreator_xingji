const {ccclass, property} = cc._decorator;
import { Game } from "./Game";
@ccclass
export default class NewClass extends cc.Component {
    @property(cc.SpriteFrame)
    flowre1Frame: cc.SpriteFrame[] = [];
    @property
    pickRadius = 0;
    @property(cc.SpriteFrame)
    starFrame: cc.SpriteFrame = null;

    first = true;
    index = 0;
    oldIndex = 0;
    radian = 0;
    circleCenter = cc.v2(0, -1285);
    circleRadius = 0;
    angle = 0;
    Speed = 0;
    public game: Game = null;
    public moveR = 0;

    onLoad () {
        this.schedule(this.circleMove, 0);
        var sp = this.node.getComponent("cc.Sprite");
        sp.SpriteFrame = this.flowre1Frame[3];
        this.node.scale = 0.7;
    }

    public init(game:Game) {
        this.game = game;
        this.circleRadius = Math.abs(this.game.ground.y-this.game.player.getComponent("Player").selfHight);
    }

    public circleMove(dt:number)
    {
        this.angle += dt * this.Speed;
        //this.radian += dt * (this.Speed/100);
        var radian = (this.angle)*0.017453293
        let x = this.moveR * Math.cos(radian) + this.circleCenter.x; 
        let y = this.moveR * Math.sin(radian) + this.circleCenter.y;
        //let angle = 360- 180/Math.PI*radian;
        // this.node.rotation = angle;
        //cc.log("pos ------------> %d, %d ,%d", dt, x ,y);
        this.node.position = cc.v2(x, y);
    }

    start () {
        
    }
    public getPlayerDistance() {
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    }

    update (dt:number) {
        if (this.getPlayerDistance() < this.pickRadius) {
            // 替换player皮肤
            this.node.destroy();
            this.game.replace(this.flowre1Frame[this.index]);    
            return;
        }
//        cc.log("this.indx = %d, %d",this.oldIndex, this.index);
        if(this.index!=this.oldIndex)
        {
            var sp = this.node.getComponent("cc.Sprite");
            sp.spriteFrame= this.flowre1Frame[this.index];  //替换为毒蘑菇图片
            this.oldIndex = this.index;
            return;
        }

        // 根据 Game 脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
        if(this.game.timer > this.game.starDuration)
        {
            this.node.destroy();
            return;
        }
    }
}
