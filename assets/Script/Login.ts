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
import { FBUtil } from "./FBLib/FBUtil";
import {GameData} from "./GameData";

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    first: cc.Label = null;
    @property(cc.Node)
    second: cc.Label = null;
    @property(cc.Node)
    third: cc.Label = null;
    @property(cc.Sprite)
    goPlay: cc.Sprite = null;
    @property(cc.Sprite)
    goFriend: cc.Sprite = null;
    @property(cc.Sprite)
    goShare: cc.Sprite = null;
    @property(cc.Sprite)
    goRank: cc.Sprite = null;
    @property(cc.Sprite)
    setAudio: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.log("loginLayer   onload()----->");
        GameData.gd.loadConfig();
        let playerName = FBUtil.getPlayerName();
        FBUtil.getConnectedPlayersAsync(this, this.connectPlayerInfo);
        FBUtil.loadAsync(null, null, false);
        //this.setLandscape();
        this.addTouchListen();
        cc.view.setResolutionPolicy(cc.ResolutionPolicy.EXACT_FIT);
    }

    setLandscape() {
            if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity",
                "changeOrientation", "(I)V", 0); //0横1竖
            }else if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
                jsb.reflection.callStaticMethod("IOSHelper", "changeOrientation:", 0);
            }else {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            let width = cc.view.getFrameSize().height < cc.view.getFrameSize().width ?
            cc.view.getFrameSize().width : cc.view.getFrameSize().height;
            let height = cc.view.getFrameSize().height > cc.view.getFrameSize().width ?
            cc.view.getFrameSize().width : cc.view.getFrameSize().height;
            cc.view.setFrameSize(width, height);
            cc.view.setDesignResolutionSize(width, height, cc.ResolutionPolicy.FIXED_WIDTH);
    }

    addTouchListen () {
        cc.log("loginLayer   addTouchListen()----->");

        this.goPlay.node.on(cc.Node.EventType.TOUCH_START, this.ToPlay, this, true);
        this.goFriend.node.on(cc.Node.EventType.TOUCH_START, this.ToFriend, this, true);
        this.goRank.node.on(cc.Node.EventType.TOUCH_START, this.ToRank, this, true);
        this.goShare.node.on(cc.Node.EventType.TOUCH_START, this.ToShare, this, true);
        this.setAudio.node.on(cc.Node.EventType.TOUCH_START, this.OnClickSound, this, true);
    }
    //开始游戏
    ToPlay()
    {
        //this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.log("loadScene rengame()--------->");
        cc.director.loadScene('rengame');
    }
    //分享
    ToShare()
    {
        cc.log("loginLayer share()--------->");
        FBUtil.share(this);
    }
    //排行榜
    ToRank()
    {
        cc.log("loginLayer ToRank()--------->");

        cc.director.loadScene("gameend");
    }
    //邀请
    ToFriend()
    {
        FBUtil.chooseAsync();
    }
    OnClickSound(){}

    connectPlayerInfo(entries:any)
    {
        let size = entries.length;
        cc.log("playerSize----------------->",size);
        let image:any = null;
        let name:any = null;
        let player:cc.Sprite = null;
        let nameNode:cc.Label = null;
        let self = this;
        
        let index = 0;
        entries.map(function(person){
            if(index < 3 && index < size)
            {   
                image = person.getPhoto();
                name = person.getName();
                cc.log("personName-------------->",name);
                if(index == 0)
                {
                    player = self.first.getComponent(cc.Sprite);
                    nameNode = self.first.getComponentInChildren("txt_name1");
                }
                else if(index == 1)
                {
                    player = self.second.getComponent(cc.Sprite);
                    nameNode = self.second.getComponentInChildren("txt_name2");
                }
                else
                {
                    player = self.third.getComponent(cc.Sprite);
                    nameNode = self.third.getComponentInChildren("txt_name3");
                }

                nameNode.string = name;

                cc.loader.load(image, function(err:Error, texture){
                    if(err){
                        console.log(err.message);
                        return;
                    }
                    player.spriteFrame = new cc.SpriteFrame(texture);   
                    player.node.setContentSize(164,164);
                })
            }
            index++;
        })  
    }    

    // update (dt) {}
}
