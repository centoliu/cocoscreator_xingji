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
    @property(cc.Sprite)
    backLogin: cc.Sprite = null;

    @property(cc.Sprite)
    myHeadFrame: cc.Sprite = null;

    @property(cc.Label)
    myName: cc.Label = null;

    @property(cc.Node)
    myScoreNode: cc.Node = null;

    @property(cc.Label)
    myNuon: cc.Label = null;

    @property(cc.Label)
    myScore: cc.Label = null;

    @property(cc.SpriteFrame)
    randBottomBlack: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    randBottomWhite: cc.SpriteFrame = null;    
    @property(cc.SpriteFrame)
    rankFirst: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    rankSecond: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    rankThird: cc.SpriteFrame = null;
    
    @property(cc.ScrollView)
    rankScroll:cc.ScrollView = null;
    @property(cc.Prefab)
    completeItem: cc.Prefab = null;

    private entries:any = null;
    private rankIndex:number = 1;
    private rankCompleteItem:Array<cc.Node> = new Array<cc.Node>();

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let myImage = FBUtil.getMyPhoto();
        //ͷ�����
        let self = this;
        cc.loader.load(myImage, function(err:Error, texture){
            if(err){
                console.log(err.message);
                return;
            }
            self.myHeadFrame.spriteFrame = new cc.SpriteFrame(texture); 
        }) 
        //���ּ���
        this.myName.string = FBUtil.getPlayerName();
        FBUtil.getPlayerEntryAsync(GameData.RANK_NAME,this,function(entry:any){
            if(entry.getRank()!=null){
                this.myNuon.string = entry.getRank();
            }else{
                this.myNuon.string = ""+0;
            } 
            if(entry.getScore()!=null){
                this.myScore.string = entry.getScore();
            }else{
                this.myScore.string = ""+0;
            } 
            if(entry.getRank()!=null && entry.getRank()<4)
            {
                this.myScoreNode.active = false;
            }else{
                this.myScoreNode.active = true;
            }});
        this.ShowRank();
    }

    ShowRank()
    {
        FBUtil.getEntriesAsync(GameData.RANK_NAME,100,0,this,this.RankCallBack);
    }
    RankCallBack(entries:any)
    {
        let size = entries.length;
        this.rankScroll.content.setContentSize(640, 110*size > 600 ? 110*size : 600);
        for(let i:number = 0; i < size; i++)
        {
            let node = cc.instantiate(this.completeItem);
            node.position = new cc.Vec2(0,-55-i*110);
            this.AlterPrefabCompleteItem(node, entries[i]);
            this.rankScroll.content.addChild(node);
            this.rankCompleteItem.push(node);
        }
    }

    AlterPrefabCompleteItem(completeItem:cc.Node, entry:any)
    {
        let rank = entry.getRank();//����
        let player = entry.getPlayer();//�����
        let score = entry.getScore();//����
        let image = player.getPhoto();//ͷ��
        let name = player.getName();//����

        let rSpriteNode = completeItem.getChildByName("rankingSprite");
        let rLabelNode = completeItem.getChildByName("rankingLabel");
        let headFrameSprite = completeItem.getChildByName("headFrame").getComponent(cc.Sprite);
        let rankNameLabel = completeItem.getChildByName("name").getComponent(cc.Label);
        let rankScoreLabel = completeItem.getChildByName("score").getComponent(cc.Label);
        let rRankBottomSprite = completeItem.getChildByName("rankBottom").getComponent(cc.Sprite);
        
        //ͷ�����
        cc.loader.load(image, function(err:Error, texture){
            if(err){
                console.log(err.message);
                return;
            }
            headFrameSprite.spriteFrame = new cc.SpriteFrame(texture);   
        })
        //����
        rankNameLabel.string = name;
        //����
        rankScoreLabel.string = score;
        rankScoreLabel.node.color = cc.color(91,0,241,255);
        //����
        let rankNumber = parseInt(rank);
        let rSprite = rSpriteNode.getComponent(cc.Sprite);
        let rLabel = rLabelNode.getComponent(cc.Label);
        switch(rankNumber)
        {
            case 1:
            {
                rLabelNode.active = false;
                rSpriteNode.active = true;
                rSprite.spriteFrame = this.rankFirst;
                rankNameLabel.node.color = cc.color(255,199,0,255);
            }break;
            case 2:
            {
                rLabelNode.active = false;
                rSpriteNode.active = true;
                rankNameLabel.node.color = cc.color(0,97,171,255);
                rSprite.spriteFrame = this.rankSecond;
            }break;
            case 3:
            {
                rLabelNode.active = false;
                rSpriteNode.active = true;
                rankNameLabel.node.color = cc.color(10,146,0,255);
                rSprite.spriteFrame = this.rankThird;
            }break;
            default:
            {
                rLabelNode.active = true;
                rLabelNode.color = cc.color(119,118,118,255);
                rSpriteNode.active = false;
                rankNameLabel.node.color = cc.color(91,0,241,255);
                rLabel.string = rank;
            }break;
        }
        //�׿�
        if(this.rankIndex % 2 == 0)//�ڵ�
        {
            rRankBottomSprite.spriteFrame = this.randBottomBlack;
            this.rankIndex++;
        }
        else//�׵�
        {
            rRankBottomSprite.spriteFrame = this.randBottomWhite;
            this.rankIndex++;
        }
    }

    OnClickBackButton()
    {
        cc.director.loadScene("login");
    }

    OnClickInvite()
    {
        cc.director.loadScene("rengame");
    }

    start () {
        this.backLogin.node.on(cc.Node.EventType.TOUCH_START, this.OnClickBackButton, this, true);
        // this.invite.node.on(cc.Node.EventType.TOUCH_START, this.OnClickInvite, this, true);
    }
    // update (dt) {}
}
