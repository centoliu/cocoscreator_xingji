// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
import { Game } from "./Game";
import { GameData } from "./GameData";
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.SpriteFrame)
    SpriteFrame: cc.SpriteFrame[] = [];

    private game: Game = null;
    turnsNum = 0;
    level = 0;
    num = 0;
    spawn = cc.repeatForever(cc.rotateBy(2, -30));
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.turnsNum = 0;
        this.num = 0;
    }

    public init(game:Game) {
        this.game = game;
        this.spawn = cc.repeatForever(cc.rotateBy(1, -this.game.Speed));
        this.spawn.setTag(200);
        this.node.runAction(this.spawn);
    }

    public updataSpeed()
    {
        this.node.stopAllActions();
        this.spawn = cc.repeatForever(cc.rotateBy(1, -this.game.Speed));
        this.spawn.setTag(200);
        this.node.runAction(this.spawn);
    }

    public replace(index:number, day:number)   //替换皮肤
    {
        this.turnsNum = day;
        this.level = index;
        var group = GameData.gd.LevelData[this.level].earth;
        var i = 0;
        if(group==1)
        {
            if(this.turnsNum%2==0)
                i = 2;
            else
                i = 3;
        }
        else
        {
            if(this.turnsNum%2==1)
                i = 0;
            else
                i = 1;
        }
        var sp = this.node.getComponent("cc.Sprite");
        sp.spriteFrame= this.SpriteFrame[i];  //替换相应皮肤
    }

    showOthterPic(): void {
        let pic: string = "Pic/pic" + this.turnsNum + "/" + "scene4.jpg";
        let self = this;
        let photo = cc.loader.getRes(pic, cc.SpriteFrame);
        if(photo) {
            self.SpriteFrame.push(photo);
        }
        else {
            cc.loader.loadRes(pic, cc.SpriteFrame, function (err: Error, sprFrame) {
                if(err) {
                    console.log(err.message);
                    return;
                }
                self.SpriteFrame.push(sprFrame);
                console.log("load pic " + pic + " succ!");
            });
        }
    }

    start () {

    }

    // update (dt) {}
}
