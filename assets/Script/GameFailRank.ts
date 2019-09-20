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
import {FBUtil} from "./FBLib/FBUtil";
import {GameData} from "./GameData";
import {Game} from "./Game";
@ccclass
export default class GameFailRank extends cc.Component {
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
    private myCurrentScore:number = 0;
    private myCurrentRank:number = 4;

    private rankCompleteItem:Array<cc.Node> = new Array<cc.Node>();
    onLoad () {
        cc.log("failRankLoad------------>");
        this.myCurrentScore = Game.game.GetPlayerScore();
    }

    start () {
        cc.log("failRankstart------------>");

        FBUtil.getEntriesAsync(GameData.RANK_NAME,3,0,this,this.RankCallBack);
    }
    ShowMyRank()
    {
        cc.log("ShowMyRank------------>");
        let node = cc.instantiate(this.completeItem);
        node.position = new cc.Vec2(0,-55-(this.rankIndex-1)*110);
        this.AlterPrefabCompleteItem(node, null, true);
        this.rankScroll.content.addChild(node);
        this.rankCompleteItem.push(node);
    }
    RankCallBack(entries:any)
    {
        cc.log("RankCallBack------------>");
        let size = entries.length;
        this.rankScroll.content.setContentSize(640, 110*size > 600 ? 110*size : 600);
        for(let i:number = 0; i < size; i++)
        {
            let node = cc.instantiate(this.completeItem);
            node.position = new cc.Vec2(0,-55-i*110);
            this.AlterPrefabCompleteItem(node, entries[i], false);
            this.rankScroll.content.addChild(node);
            this.rankCompleteItem.push(node);
        }
        this.ShowMyRank();
    }
    AlterPrefabCompleteItem(completeItem:cc.Node = null, entry:any = null, myRank:boolean = false)
    {
        cc.log("AlterPrefabCompleteItem------------>");
        let rank:any = null;
        let player:any = null;
        let score:any = null;
        let image:any = null;
        let name:any = null;
        if(!myRank)
        {
            rank = entry.getRank();
            player = entry.getPlayer();
            score = entry.getScore();
            image = player.getPhoto();
            name = player.getName();
        }
        else
        {
            rank = this.myCurrentRank;
            score = this.myCurrentScore;
            image = FBUtil.getMyPhoto();
            name = FBUtil.getPlayerName();
        }    
        let rSpriteNode = completeItem.getChildByName("rankingSprite");
        let rLabelNode = completeItem.getChildByName("rankingLabel");
        let headFrameSprite = completeItem.getChildByName("headFrame").getComponent(cc.Sprite);
        let rankNameLabel = completeItem.getChildByName("name").getComponent(cc.Label);
        let rankScoreLabel = completeItem.getChildByName("score").getComponent(cc.Label);
        let rRankBottomSprite = completeItem.getChildByName("rankBottom").getComponent(cc.Sprite);
        
        cc.loader.load(image, function(err:Error, texture){
            if(err){
                console.log(err.message);
                return;
            }
            headFrameSprite.spriteFrame = new cc.SpriteFrame(texture);   
        })
        rankNameLabel.string = name;
        rankScoreLabel.string = score;
        let rankNumber = parseInt(rank);
        let rSprite = rSpriteNode.getComponent(cc.Sprite);
        let rLabel = rLabelNode.getComponent(cc.Label);
        if(!myRank && this.myCurrentScore >= score)
            this.myCurrentRank = rank;
        switch(rankNumber)
        {
            case 1:
            {
                rLabelNode.active = false;
                rSpriteNode.active = true;
                rSprite.spriteFrame = this.rankFirst;
                rankNameLabel.node.color = cc.color(255,199,0,255);
            }
            break;
            case 2:
            {
                rLabelNode.active = false;
                rSpriteNode.active = true;
                rSprite.spriteFrame = this.rankSecond;
            }
            break;
            case 3:
            {
                rLabelNode.active = false;
                rSpriteNode.active = true;
                rSprite.spriteFrame = this.rankThird;
            }
            break;
            default:
            {
                rLabelNode.active = true;
                rSpriteNode.active = false;
                rLabel.string = rank;
            }
            break;
        }
        if(this.rankIndex % 2 == 0)
        {
            rRankBottomSprite.spriteFrame = this.randBottomBlack;
            this.rankIndex++;
        }
        else
        {
            rRankBottomSprite.spriteFrame = this.randBottomWhite;
            this.rankIndex++;
        }
    }
    // update (dt) {}
}
