import { Player } from "./player";
import {GameData} from "./GameData";
import {FBUtil} from "./FBLib/FBUtil";

const { property, ccclass } = cc._decorator;

@ccclass
export class Game extends cc.Component {
    static game: Game = new Game();
    // 这个属性引用了星星的预制资源
    @property(cc.Prefab)
    private starPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private flowerPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private applePrefab: cc.Prefab = null;
    // 星星产生后消失时间的随机范围
    @property(cc.Integer)
    private maxStarDuration = 0;
    @property(cc.Integer)
    private minStarDuration = 0;
    // 地面节点，用于确定星星生成的高度
    @property(cc.Node)
    public ground: cc.Node = null;
    // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
    @property(cc.Node)
    public player: cc.Node = null;
    // score label 的引用
    @property(cc.Label)
    private scoreDisplay: cc.Label = null;
    @property(cc.Label)
    private poisonDisplay: cc.Label = null;
    @property(cc.Label)
    private TurnsDisplay: cc.Label = null;
    @property(cc.Label)
    public TimesDisplay: cc.Label = null;
    @property({tooltip:"旋转角速度"})
    Speed = 0;
    @property()
    private PlayerSpeed = 0;
    @property({
        tooltip: "星星收集距离"
    })
    private pickRadius: number = 0;
    // 得分音效资源
    @property({
        type: cc.AudioClip
    })
    private scoreAudio: cc.AudioClip = null;
    @property(cc.Sprite)
    noThanks: cc.Sprite = null;
    @property(cc.Node)
    advertisement: cc.Node = null;
    @property(cc.Sprite)
    watchVideo: cc.Sprite = null;
    @property(cc.Node)
    gameLogic: cc.Node = null;
    @property(cc.Sprite)
    backLogin: cc.Sprite = null;
    @property(cc.Node)
    allStars: cc.Node = null;
    @property(cc.Node)
    allFlower: cc.Node = null;

    // 地面节点的Y轴坐标
    private groundY: number;
    // 定时器
    public timer: number;
    // 星星存在的持续时间
    public starDuration: number;
    // 当前分数
    private score: number;
    IsTouching:boolean = false;   //是否长按
    public canmove:boolean = true;
    public moveCount:number = 0;
    mushroom =  new Array();
    circleCenter = GameData.gd.CircleCenter;
    turnsNum = 0;
    flyTime = 0;
    touchTime = 0;   //长按触摸时间
    starNum= 0;   //星星数量
    starGroupTim = 0;   //星星组创建周期
    turnTime = 0;
    private canClickWatchAd:boolean = true;
    private watchAdNum:number = 1;
    private whetherWatchAd:boolean = false;
    public istouchend = false;
    public istimerOver = false;

    protected onLoad() {
        cc.log("gamelayer   onLoad()------>");

        this.registerEvent();
        cc.view.setOrientation(2);
        this.ground.getComponent('Ground').init(this);
        this.player.getComponent('Player').game = this;

        // 获取地平面的 y 轴坐标
        this.groundY = Math.abs(this.player.y-this.ground.y);
        // 初始化计时器
        this.timer = GameData.gd.flyTime;
        this.starDuration = 0;
        // 初始化计分
        this.score = 0;
        this.starNum = 3;
        this.starGroupTim = 8;
        this.turnTime = 24;
        this.canmove = true;
        //this.spawnNewStar();
        this.goSchedule();
        GameData.gd.CircleCenter = cc.v2(0,this.ground.y);

        this.addTouchListen();
    }

    public goSchedule(){
        this.schedule(this.addStars, this.starGroupTim);
        this.schedule(this.addTurns, 24);
        this.schedule(this.addApple, 12);
        this.schedule(this.addFlower, 8);
        this.schedule(this.playerMove, 0.01);
    }

    public clearSchedule(){
        this.unschedule(this.addStars);
        this.unschedule(this.addTurns);
        this.unschedule(this.addApple);
        this.unschedule(this.addFlower);
        this.unschedule(this.playerMove);
    }

    addTouchListen () {
        cc.log("gamelayer   addTouchListen()------>");
        this.noThanks.node.on(cc.Node.EventType.TOUCH_START, this.OnClickBacklogin, this, true);
        this.watchVideo.node.on(cc.Node.EventType.TOUCH_START, this.OnClickContinueGame, this, true);
        this.backLogin.node.on(cc.Node.EventType.TOUCH_START, this.OnClickBacklogin, this, true);
    }

    public registerEvent() {
        //touchstart 可以换成cc.Node.EventType.TOUCH_START
        this.node.on(cc.Node.EventType.TOUCH_START, this.onEventStart, this);
        //touchmove 可以换成cc.Node.EventType.TOUCH_MOVE
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onEventMove, this);
        //touchcancel 可以换成cc.Node.EventType.TOUCH_CANCEL
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onEventCancel, this);
        //touchend 可以换成cc.Node.EventType.TOUCH_END
        this.node.on(cc.Node.EventType.TOUCH_END, this.onEventEnd, this);
    }

    protected Startfly()
    {
        cc.log("Startfly---------->");
        //this.moveCount+=1;
        //this.cleanListen();
        this.istimerOver = true;
        this.IsTouching = false;
        this.touchTime = 0;
        this.canmove = false;
        this.player.getComponent('Player').startDrop(this.player.y);
    }

    protected onEventCancel()
    {
        // this.IsTouching = false;
        // this.touchTime = 0;
        // //this.unschedule(this.Startfly);
        // this.player.getComponent('Player').startDrop(this.player.y);
    }

    protected onEventStart(event)
    {
        cc.log("this.canmove===",this.canmove,this.whetherWatchAd);
        if (this.canmove==true && this.timer>0) {
            this.player.stopActionByTag(GameData.gd.ACTION_TAG);
            this.IsTouching = true;
            this.touchTime = 0;
            this.istouchend = false;
        }
    }

    protected onEventMove(event) {
        
    }

    public GetPlayerScore()
    {
        return this.score;
    }

    protected onEventEnd()
    {
        cc.log("onEventEnd--------->");
        this.istouchend = true;
        this.IsTouching = false;
        this.touchTime = 0;
        this.player.getComponent('Player').startDrop(this.player.y);
    }

    //每转5s
    protected addStars(dt:number)
    {
        this.spawnNewStar();  
    }

    OnClickBacklogin()
    {
        cc.log("OnClickBacklogin--------->");
        this.BackToLoginBoudary();
    }
    //返回开始界面
    public BackToLoginBoudary()
    {
        // let localChapter = {chapterNum:(this.score)};
        // GameData.gd.UpdatePlayerScore(this.score);
        // FBUtil.setScoreAsync(GameData.RANK_NAME, this.score, JSON.stringify(localChapter), this, this.ReturnLoginCallBack);
        cc.log("loadScenelogin---->");
        cc.director.loadScene("login");
    }
    //看广告
    OnClickContinueGame()
    {
        cc.log("OnClickContinueGame()-------------->");
        if(this.canClickWatchAd && this.watchAdNum>0)
        {
            this.canClickWatchAd = false;
            //广告预留
            //this.ClickContinueCallBack(true);
            FBUtil.showAsync(this, this.ClickContinueCallBack);
            //FBUtil.showInterstitialAd(this, this.ClickContinueCallBack);
        }
    }
    //返回继续游戏
    ClickContinueCallBack(res:boolean)
    {
        cc.log("ClickContinueCallBack()-------------->");
        // cc.director.resume();
        this.allStars.removeAllChildren();
        this.allFlower.removeAllChildren();
        if(this.Speed>GameData.gd.Speed)
        {
            this.Speed-=15;
        }
        this.ground.getComponent("Ground").updataSpeed();
        this.player.y = this.player.getComponent("Player").selfHight;
        this.advertisement.active = false;
        //重置跳跃
        this.canmove=true;
        this.IsTouching = false;
        this.timer = 0;
        this.gameLogic.active = true;
        this.watchAdNum = (this.watchAdNum > 0) ? (this.watchAdNum-1) : 0;
        this.whetherWatchAd = true;
        this.canClickWatchAd = true;
        this.goSchedule();
        this.registerEvent();
    }

    ReturnLoginCallBack()
    {
        ;//cc.director.loadScene("login");
    }
    //添加果子
    protected addApple()
    {
        // 使用给定的模板在场景中生成一个消除道具
        var i=0;
        // 为flower设置一个随机位置
        var angle = 210+Math.random()*30;  //随机角度
        var heightA = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight*2;
        var apple = cc.instantiate(this.applePrefab);
        var pos = this.getGrounpPos(heightA, angle, i);
        apple.setPosition(pos);
        this.allStars.addChild(apple);
        apple.getComponent('Apple').index = Math.round(Math.random()*4);  //0~4
        apple.getComponent('Apple').init(this);
        apple.getComponent('Apple').angle = angle;
        apple.getComponent('Apple').Speed = this.Speed;
        apple.getComponent('Apple').moveR = heightA;//花朵旋转半径
    }

    protected addFlower()
    {
        // 使用给定的模板在场景中生成一个皮肤碎片
        var i = 0;
        var angle = 40+30*Math.random();  //随机角度
        var heightA = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight*2;
        var flower = cc.instantiate(this.flowerPrefab);
        var pos = this.getGrounpPos(heightA, angle, i);
        flower.position = pos;
        this.allFlower.addChild(flower);
        flower.getComponent('Flower').index = Math.round(Math.random()*4);  //0~4
        flower.getComponent('Flower').init(this);
        flower.getComponent('Flower').angle = angle;
        flower.getComponent('Flower').Speed = this.Speed;
        flower.getComponent('Flower').moveR = heightA;//花朵旋转半径

        //重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
    }

    protected spawnNewStar() {     
        // 使用给定的模板在场景中生成一个星星
        var i=0;
        // 为星星设置一个随机位置
        var angle = Math.random()*20;  //随机角度
        var heightA = this.groundY + Math.random() * this.player.getComponent('Player').jumpHeight*2;

        for(var i=0;i<this.starNum;i++)
        {
            var h = heightA+20*Math.random()*i;     //随机高度
            var newStar = cc.instantiate(this.starPrefab);
            var pos = this.getGrounpPos(heightA, angle, i);
            newStar.setPosition(pos);
            this.allStars.addChild(newStar);
            newStar.getComponent('Stars').init(this);
            newStar.getComponent('Stars').angle = angle+5*i;
            newStar.getComponent('Stars').Speed = this.Speed;
            newStar.getComponent('Stars').moveR = h;//星星旋转半径
        }
    }

    public delmushroom()
    {
        //消除第一个毒蘑菇
        if(this.mushroom!=null)
        {
            var mushroom = this.mushroom.shift();
            if(mushroom)
            {
                mushroom.destroy();
                this.Addposion();
            }
        }
    }

    protected getGrounpPos(heightA:number, angle:number, i:number)
    {
        var radian = (angle +5*i)*0.017453293   //去弧度
        let x = heightA * Math.cos(radian) + this.circleCenter.x; 
        let y = heightA * Math.sin(radian) + this.circleCenter.y;
        return cc.v2(x, y);
    }

    protected getNewStarPosition (heightA:number, angle:number) {
        var randX = 0;
        var randY = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var radian = angle*0.017453293;   //取弧度
        randY = heightA*Math.sin(radian);
        randX = heightA*Math.cos(radian);
        // 返回星星坐标
        if(angle>=180 && angle<=360)
        {
            randY = -randY;
        }
        //cc.log("position---:>%d,%d",angle,randX,randY);
        return cc.v2(randX, randY);
    }

    public gainScore () {
        this.score += 1;
        GameData.gd.UpdatePlayerScore(this.score);
        var player = this.player.getComponent('Player');
        player.sizeByscore += 1;

        if(this.timer<=8)
        {
            this.timer += 1;
        }
        // cc.log("this.timer---------->",this.timer);
        this.updataTimes();

        cc.log("gainScore--------->",player.sizeByscore, player.curSize);
        if(player.curSize==GameData.gd.numSub(GameData.gd.Player_Size,GameData.gd.Player_ChangeSize*2) && player.sizeByscore == GameData.gd.Player_toMid)
        {
            player.reSetSize(GameData.gd.numAdd(player.curSize,GameData.gd.Player_ChangeSize));
        }
        else if(player.curSize==GameData.gd.numSub(GameData.gd.Player_Size,GameData.gd.Player_ChangeSize) && player.sizeByscore == GameData.gd.Player_toBig)
        {
            player.reSetSize(GameData.gd.numAdd(player.curSize,GameData.gd.Player_ChangeSize));
        }
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    }

    public Addposion()
    {
        this.poisonDisplay.node.scale = 1;
        this.poisonDisplay.node.stopAllActions();
        var action1 = cc.scaleBy(0.05,1.25);
        var action2 = cc.scaleBy(0.05,0.8);
        var fun = cc.callFunc(this.AddPosionCallback, this);
        this.poisonDisplay.node.runAction(cc.sequence(action1, fun, action2));
    }

    protected AddPosionCallback()
    {
        if(this.mushroom)
        {
            if(this.mushroom.length!=null){
                this.poisonDisplay.string = 'Posion: ' + this.mushroom.length;
            }else{
                this.poisonDisplay.string = 'Posion: ' + 0;
            }
        }
    }

    protected addTurns()
    {
        this.turnsNum += 1;
        // 更新 TurnsDisplay Label 的文字
        var day = Math.floor(this.turnsNum/2)
        this.TurnsDisplay.string = 'Day: ' + day;
        cc.log("'Turns: ' + day------->",day);
        this.ground.getComponent("Ground").replace(GameData.gd.LevelData[day].earth, this.turnsNum);

        this.flyTime -= GameData.gd.LevelData[day].flyTimeChange;
        this.Speed = GameData.gd.LevelData[day].angularChange * GameData.gd.Speed;
        this.starNum = GameData.gd.LevelData[day].starNum;
        this.turnTime = 360/this.Speed;
        this.starGroupTim = this.turnTime/GameData.gd.LevelData[day].starGroup;
        this.ground.getComponent("Ground").updataSpeed();
        // 播放得分音效
        // 删除果子
        // cc.audioEngine.playEffect(this.scoreAudio, false);
        this.unschedule(this.addStars);    //重置计时器，增加难度
        this.starNum+=1;
        this.schedule(this.addStars, this.starGroupTim);
    }

    public gameOver () {
        // cc.director.pause();
        cc.log("gameover--------------->");
        this.ground.stopAllActions();
        this.advertisement.active = true;
        this.clearSchedule();
        this.cleanListen();
        this.gameLogic.active = false;
        // let localChapter = {chapterNum:(this.turnsNum)};
        // GameData.gd.UpdatePlayerScore(this.score);
        // FBUtil.setScoreAsync(GameData.RANK_NAME, this.score, JSON.stringify(localChapter), this, this.ReturnLoginCallBack);
        // this.player.stopAllActions(); //停止 player 节点的跳跃动作
        // cc.director.loadScene('gameend');
    }
    public replace(index:cc.SpriteFrame)
    {
        this.player.getComponent('Player').replace(index);
    }

    public cleanListen(){
        // 取消键盘输入监听
        this.node.off('touchstart', this.onEventStart, this);
        //touchmove 可以换成cc.Node.EventType.TOUCH_MOVE
        this.node.off('touchmove', this.onEventMove, this);
        //touchcancel 可以换成cc.Node.EventType.TOUCH_CANCEL
        this.node.off('touchcancel', this.onEventCancel, this);
        //touchend 可以换成cc.Node.EventType.TOUCH_END
        this.node.off('touchend', this.onEventEnd, this);
    }

    protected onDestroy () {
        this.cleanListen();
        if(this.noThanks.node!=null)
        {
            this.noThanks.node.off(cc.Node.EventType.TOUCH_START, this.OnClickBacklogin, this, true);
            this.watchVideo.node.off(cc.Node.EventType.TOUCH_START, this.OnClickContinueGame, this, true);
            this.backLogin.node.off(cc.Node.EventType.TOUCH_START, this.OnClickBacklogin, this, true);
        }
        this.clearSchedule();
    }

    public updataTimes()
    {
        if(this.timer<0)
            this.timer=0;
        this.TimesDisplay.string = 'Fly Times: ' + Math.floor(this.timer);
    }

    private playerMove(dt:number)
    {
        // cc.log("this.IsTouching-------------------->",this.IsTouching, this.canmove);

        if (this.IsTouching == true && this.canmove == true) {
            // cc.log("this.IsTouching-------------------->");
            let movey = dt*this.PlayerSpeed*10;//this.touchTime*this.PlayerSpeed;(加速)
            let maxy = this.player.getComponent('Player').jumpHeight*2+this.player.getComponent('Player').selfHight;
            let miny = this.player.getComponent('Player').selfHight;
            if(this.player.y>maxy)
            {
                this.player.y = maxy;
            }
            else if(this.player.y<miny)
            {
                this.player.y = miny;
            }
            else
            {
                this.player.y += movey;
            }
        }
        // 更新计数器，每五秒player落地
        // this.touchTime -= dt;
        if(this.timer<=0 && this.canmove == true)
        {
            this.canmove = false;
            this.timer=this.flyTime;
            this.Startfly();
            this.updataTimes();
        }
        if (Math.round(this.player.y)>this.player.getComponent('Player').selfHight) {
            this.timer -= dt;
            this.updataTimes();
        }
    }

    protected update (dt:number) {

    }
}
