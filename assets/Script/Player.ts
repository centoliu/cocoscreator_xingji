const { ccclass, property } = cc._decorator;
import { Game } from "./Game";
import {GameData} from "./GameData";

@ccclass
export class Player extends cc.Component {
    // 主角跳跃高度
    @property(cc.Integer)
    public jumpHeight: number = 0;
    // 主角跳跃持续时间
    @property(cc.Integer)
    private jumpDuration: number = 0;
    // 最大移动速度
    @property(cc.Integer)
    private maxMoveSpeed: number = 0;
    // 加速度
    @property(cc.Integer)
    private accel: number = 0;
    @property()
    dropSpeed = 0;
    
    // 跳跃音效资源
    @property({
        type: cc.AudioClip
    })
    private jumpAudio: cc.AudioClip = null;

    public selfHight:number = -145;
    jumpTotal = 0;
    private xSpeed: number = 0;
    private accLeft: boolean = false;
    private accRight: boolean = false;
    private jumpAction: cc.Action = null;
    public canJump: boolean = true;
    private jumpCount: number = 0;
    public accJump: boolean = false;   //是否在drop
    public game: Game = null;
    private action1 = null;
    public Data:GameData = null;
    public sizeByscore = 0;
    public curSize = 0;
    public Invincible = false;
    private setJumpAction(PositionY:number) {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.v2(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var t = (PositionY*this.jumpDuration/this.jumpHeight);
        var jumpDown = cc.moveBy(t+this.jumpDuration, cc.v2(0, -(this.jumpHeight+PositionY))).easing(cc.easeCubicActionIn());

        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        var resetJump = cc.callFunc(this.resetJump, this);
        // 而且每次完成落地动作后调用回调来播放声音
        return cc.repeat(cc.sequence(jumpUp, resetJump ,jumpDown, callback),1);
    }
    public startDrop(posY:number)
    {
        //掉落条件满足异或
        if((this.game.istimerOver==true && this.game.istouchend==false)||(this.game.istimerOver==false && this.game.istouchend==true))
        {
            this.node.stopActionByTag(GameData.gd.ACTION_TAG);
            //开始drop动画
            cc.log("startDrop--------->",Math.abs(this.node.y-this.selfHight)/this.dropSpeed/10, this.node.y, this.selfHight);
            var drop = cc.moveTo(Math.abs(this.node.y-this.selfHight)/this.dropSpeed/10, cc.v2(0,this.selfHight));//.easing(cc.easeQuinticActionIn());//.easing(cc.easeIn(100));
            var fun = cc.callFunc(this.resetFly, this);
            var action = cc.repeat(cc.sequence(drop,fun),1);
            action.setTag(GameData.gd.ACTION_TAG);
            this.node.runAction(action);
        }
    }
    private resetFly()
    {
        this.game.canmove = true;
        this.game.moveCount = 0;
        var time = GameData.gd.flyTime-GameData.gd.LevelData[Math.floor(this.game.turnsNum/2)].flyTimeChange;
        if(this.game.timer<=time){
            this.game.timer = time;
        }
        this.game.istimerOver = false;
        this.game.istouchend = false;
        //this.game.registerEvent();
        this.canJump = true;
        cc.log("resetFly----------------->",this.game.timer);
        this.game.updataTimes();
    }

    private resetJump(){
        //this.canJump = true;
    }

    public reSetSize(size:number)
    {
        //cc.log("reSetPlayerSize------------->",this.sizeByscore,this.node.scale);
        this.node.scale = size;
        this.curSize = size;
        this.sizeByscore = 0;
        this.game.getComponent("Game").pickRadius = GameData.gd.pickRadius*size;
        if(this.curSize==GameData.gd.numSub(GameData.gd.Player_Size,GameData.gd.Player_ChangeSize*2)){
            this.selfHight=-134;
        }
        else if(this.curSize==GameData.gd.numSub(GameData.gd.Player_Size,GameData.gd.Player_ChangeSize)){
            this.selfHight=-127;
        }
        else if(this.curSize==GameData.gd.Player_Size){
            this.selfHight = -120;
        }

        if (this.Invincible) {
            this.schedule(this.notInvincible, 12);
        }
    }

    private notInvincible()
    {
        this.Invincible = false;
    }

    private playJumpSound() {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
        //重置跳跃次数
        this.jumpCount = 0;
    }

    private replace(index:cc.SpriteFrame)   //替换皮肤
    {
        var sp = this.node.getComponent("cc.Sprite");
        sp.spriteFrame= index;  //替换相应皮肤
    }

    onLoad() {
        this.jumpCount = 0;
        this.canJump = false;
        // 初始化跳跃动作
        // this.jumpAction = this.setJumpAction(this.node.y);
        // this.jumpAction.setTag(1);
        //this.node.runAction(this.jumpAction);
        var xuanzhuan = cc.rotateBy(0.5, 180);
        this.action1 = cc.repeatForever(xuanzhuan);
        this.node.runAction(this.action1);
        this.reSetSize(0.6);

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        this.accJump = false;
        // 主角当前水平方向速度
        //this.xSpeed = 0;
    }

    update (dt:number) {
        //按下按键保持位置漂浮
    }
}