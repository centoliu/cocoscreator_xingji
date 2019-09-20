import { Game } from "./Game";
import {GameData} from "./GameData";

const {ccclass,property} = cc._decorator;

@ccclass
export class Stars extends cc.Component {

    // 星星和主角之间的距离小于这个数值时，就会完成收集
    private pickRadius: number = 0;

    @property(cc.SpriteFrame)
    starFrame: cc.SpriteFrame = null;

    private game: Game = null;
    first = true;
    Isclock:boolean = false;
    mushroom = false;  //当前不是毒蘑菇
    radian = 0;
    circleCenter = GameData.gd.CircleCenter;
    circleRadius = 0;
    public moveR = 0;
    angle = 0;
    Speed = 0;
    pos1 = null;
    maxH = 0;
    minH = 0;
    player = null;

    onLoad()
    {
        this.schedule(this.circleMove, 0.01);
        this.Isclock = false;
    }

    public init(game:Game) {
        this.game = game;
        this.player = this.game.player.getComponent("Player");
        this.pickRadius = this.game.getComponent("Game").pickRadius;
        this.circleRadius = Math.abs(this.game.player.getComponent("Player").selfHight-this.game.ground.y);

        var posgroud = this.game.ground.convertToWorldSpaceAR(cc.v2(0, 0));//convertToWorldSpaceAR(cc.v2(0, 0));
        this.maxH = posgroud.y+this.circleRadius+this.game.player.getComponent("Player").jumpHeight;
        this.minH = posgroud.y+this.circleRadius;
    }

    private getPlayerDistance () {
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = this.node.position.sub(playerPos).mag();
        return dist;
    }

    private circleMove(dt:number)
    {
        this.angle += dt * this.game.Speed;
        //this.radian += dt * (this.Speed/100);
        var radian = (this.angle)*0.017453293
        let x = this.moveR * Math.cos(radian) + this.circleCenter.x; 
        let y = this.moveR * Math.sin(radian) + this.circleCenter.y;
        //cc.log("circleMove--->",this.moveR);
        this.node.position = cc.v2(x, y);
    }

    private startDrop()
    {
        //cc.log("pos  %d, %d",this.node.x, this.node.y);
        var time = 1;
        var changAngle = this.Speed*time;
        //cc.log("this.circleRadius--------------->",this.circleRadius)
        var r = this.circleRadius//1150;//this.game.ground.height/3;
        var radian = (changAngle+this.angle)*0.017453293
        let x = r * Math.cos(radian) + this.circleCenter.x; 
        let y = r * Math.sin(radian) + this.circleCenter.y;
        var action = cc.moveTo(time,cc.v2(x,y));//.easing(cc.easeCubicActionIn());
        var resetCir = cc.callFunc(this.resetCir, this);
        this.angle+=changAngle;
        //cc.log("startDrop  %d, %d ,%d", changAngle, x ,y);
        this.node.runAction(cc.repeat(cc.sequence(action, resetCir),1));
    }

    private resetCir()  //落地之后变成毒蘑菇
    {
        this.moveR = this.circleRadius;
        this.mushroom = true;
        this.game.mushroom.push(this.node);
        this.game.Addposion();
        var sp = this.node.getComponent("cc.Sprite");
        sp.spriteFrame= this.starFrame;  //替换为毒蘑菇图片
        this.schedule(this.circleMove, 0.01);
    }

    private getPosXmis()
    {
        // 根据 player 节点位置判断距离
        var pos2 = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.pos1 = this.game.player.convertToWorldSpaceAR(cc.v2(0, 0));
        // 根据两点位置计算两点之间距离
        if(this.pos1.x>pos2.x && pos2.y<this.maxH && pos2.y>this.minH)
            return true;
        else
            return false;
    }

    private onPicked(pos:cc.Vec2) {
        //收集星星，并且执行星星跑向player的动画
        //this.node.stopActionByTag(GameData.gd.ACTION_TAG_1);
        var run = cc.moveTo(1, pos);
        var callback = cc.callFunc(this.callback, this);
        var action = cc.repeat(cc.sequence(run, callback),1);
        action.setTag(GameData.gd.ACTION_TAG_1);
        this.node.runAction(action);
        //cc.log("runtoplayer---------------->", pos.y);
    }

    private callback()
    {
        // 调用 Game 脚本的得分方法
        this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
    }

    update(dt:number) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius || this.Isclock==true) {
            if(this.mushroom && this.player.Invincible==false){
                cc.log("this.player.curSize------>",this.player.curSize, this.player.curSize-GameData.gd.Player_ChangeSize);

                this.player.curSize = GameData.gd.numSub(this.player.curSize,GameData.gd.Player_ChangeSize);
                if(this.player.curSize<GameData.gd.Player_MINSize){
                    this.game.gameOver();
                    this.game.enabled = false;
                }else{
                    this.player.Invincible = true;
                    this.player.reSetSize(this.player.curSize)
                }
            }
            // 调用收集行为
            if(this.mushroom){
                //消除毒蘑菇
                var i = this.game.mushroom.indexOf(this.node);
                this.game.mushroom.splice(i,1);
                this.game.Addposion();
                this.node.destroy();
            }else{
                this.callback();
            }
            // this.Isclock = true;
            // this.onPicked(this.game.player.getPosition());
            return;
        }

        if(this.getPosXmis() && this.first){ //开始处理drop
            this.first = false;
            this.unschedule(this.circleMove);
            this.startDrop();
            return;
        }
    }
}