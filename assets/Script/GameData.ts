const {ccclass, property} = cc._decorator;

import { Game } from "./Game";
import { TurnInfo } from "./DefClass";

export class GameData extends cc.Component {
    public static gd: GameData = new GameData();
    private game: Game = null;
    
    public ACTION_TAG:number = 100; 
    public ACTION_TAG_1:number = 101;
    public CircleCenter = cc.v2(0, -1280);
    //player大小控制
    public Player_Size = 1;
    public Player_ChangeSize = 0.2;
    public Player_MINSize = 0.6;
    public Player_toBig = 40;
    public Player_toMid = 20;
    //初始飞行时间
    public flyTime = 5;
    public Speed = 15;
    //玩家分数存储
    public playScore:number = 0;
    public pickRadius = 60;
    
    public LevelData: Array<TurnInfo> = new Array<TurnInfo>();
    public static readonly RANK_NAME = "touristrank";

    constructor()
    {
        super();
        this.Init();
        this.loadConfig();
    }
    Init()
    {
        let str = cc.sys.localStorage.getItem("score");
        if(str)
            this.playScore = parseInt(str);
    }
    GetPlayerScore():number
    {
        return this.playScore;
    }
    UpdatePlayerScore(score:number)
    {
        if(score > this.playScore)
            cc.sys.localStorage.setItem("score", score.toString());
    }
    
    loadConfig()
    {
        let self = this;
        cc.loader.loadRes('config/turnsData.json', function (err: Error, jsonAsset: cc.JsonAsset) {
            if(err) {
                console.log("config/turnsData err -> " + err.message);
                return;
            }
            let json: JSON = jsonAsset.json;
            for(let i: number = 0; i < json["Turns"].length; i++) {
                let stage = json["Turns"][i];
                let cell: TurnInfo = new TurnInfo();
                cell.turn = parseInt(stage["turn"]);
                cell.starNum = parseInt(stage["starNum"]);
                cell.starGroup = parseInt(stage["starGroup"]);
                cell.flyTimeChange = parseFloat(stage["flyTimeChange"]);
                cell.angularChange = parseFloat(stage["angularChange"]);
                cell.earth = parseInt(stage["earth"]);
                // let rightWords: string = stage["word"];

                self.LevelData.push(cell);
            }
        });
    }

    numAdd(num1:number, num2:number) {
        var baseNum:number, baseNum1:number, baseNum2:number;
        try {
            baseNum1 = num1.toString().split(".")[1].length;
        } catch (e) {
            baseNum1 = 0;
        }
        try {
            baseNum2 = num2.toString().split(".")[1].length;
        } catch (e) {
            baseNum2 = 0;
        }
        baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
        return (num1 * baseNum + num2 * baseNum) / baseNum;
    }
    numSub(arg1:number, arg2:number) { 
        var r1:number, r2:number, m:number, n:number; 
        try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 } 
        try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 } 
        m = Math.pow(10, Math.max(r1, r2)); 
        n = (r1 >= r2) ? r1 : r2; 
        return parseFloat(((arg1 * m - arg2 * m) / m).toFixed(n)); 
    } 
}
