﻿module leftui {
    export class TaskListUi {
        public bg: UICompenent;
        private perent: any;
        private uiAtlas: UIAtlas;
        public constructor($perent: any, $uiAtlas: UIAtlas) {
            this.perent = $perent;
            this.uiAtlas = $uiAtlas;
            this.taskItem = new Array;
        }
        private taskItem: Array<quest.QuestTaskVo>;
        private totalH: number = 0;
        private lastTotalH: number = 0
        private uiheight220: number = 215;
        public static showType:number=0
        public refresh(): void {
            var $uiScale: number = TaskListUi.taskUiScale15;

            if (TaskListUi.showType == 0) { 
                this.getItemShow();//任务
            } else if(TaskListUi.showType == 1){
                this.getlilianItem();//历练
            }else if(TaskListUi.showType == 2){
                this.getBossItem();//boss列表
            }

            var rec: UIRectangle = this.uiAtlas.getRec(this.bg.skinName);
            var $ctx: CanvasRenderingContext2D = UIManager.getInstance().getContext2D(rec.pixelWitdh * $uiScale, 840 * $uiScale, false);

            var ty: number = 0
            for (var i: number = 0; i < this.taskItem.length; i++) {
                var $th: number = this.drawTempTask($ctx, this.taskItem[i], ty)
                ty += ($th + 12) * $uiScale;
          
            }
            TextureManager.getInstance().updateTexture(this.uiAtlas.texture, rec.pixelX, rec.pixelY, $ctx);
            this.totalH = ty + 10;
            var $mainH: number = this.uiheight220 - (this.bg.y - 120)
            this.bg.height = Math.min($mainH, this.totalH / $uiScale)

            if (this.lastTotalH != this.totalH) {
                if (this.lastTotalH > this.totalH) {
                    this.taskTy = 0;
                }
                this.lastTotalH = this.totalH
            }
            //this.taskTy = this.taskTy;
            this.resize()
            this.testFinish()
            //console.log("===============> this.taskTy this.taskTy", this.taskTy)
        }
        private getBossItem(): void
        {
            var $item: Array<SListItemData> = sboss.SbossModel.getInstance().getItemData();
            this.taskItem = new Array();
            for (var i: number = 0; i < $item.length; i++) {
                var meshBossVo: sboss.MeshBossVo = $item[i].data
                if (meshBossVo.tb.mapid == GuidData.map.tbMapVo.id) {
                    var $tb_Vo: tb.TB_creature_template = tb.TB_creature_template.get_TB_creature_template(meshBossVo.tb.bossEntry)
                    meshBossVo.str = ColorType.Yellowedce7e + $tb_Vo.name
                    meshBossVo.str += ColorType.Yellowedce7e+" Lv" + $tb_Vo.level
                    var $tm: number = GameInstance.getGameSecond(meshBossVo.time);
                    var $str: string;
                    if (meshBossVo.state == 1 && $tm > 0) {
                        meshBossVo.str += " "+ColorType.Redd92200 + getScencdStr($tm)
            
                    } else {
                        meshBossVo.str += ColorType.Green20a200 + " 已刷新";
                    }
                    var $dailyQuestTaskVo: quest.QuestTaskVo = new quest.QuestTaskVo();
                    $dailyQuestTaskVo.meshBossVo = meshBossVo
                    this.taskItem.push($dailyQuestTaskVo);
                }
            }
            TimeUtil.addTimeOut(1000, () => {
                this.refresh();
            });
        }
        // private getBossName($bossEntry: number): string {
        //     var $tb_Vo: tb.TB_creature_template = tb.TB_creature_template.get_TB_creature_template($bossEntry)
        //     return $tb_Vo.name;
        // }
        private getlilianItem(): void
        {
            this.taskItem = new Array();
            var $item: Array<training.TaskVo> = training.TrainingModel.getInstance().getTaskvo();
            for (var j: number = 0; j < $item.length; j++) {
                if ($item[j].questData) {
                    var $dailyQuestTaskVo: quest.QuestTaskVo = new quest.QuestTaskVo()
                    
                    if ($item[j].questData.taskState!=6) {
                        // //console.log(j, "历练", $item[j].questData)
                        $dailyQuestTaskVo.tb_quest = $item[j].tab_quest;
                        $dailyQuestTaskVo.questDataVo = $item[j].questData;
                        var propid: number = $item[j].tab_adventure.upres[0];
                        var propnum: number = $item[j].tab_adventure.upres[1];
                        var txtcolor: string = GuidData.player.getResType(propid) >= propnum ? ColorType.Green2ca937 : ColorType.Redd92200;

                        $dailyQuestTaskVo.questDataVo.items[0].process = GuidData.player.getResType(propid)
                        var $arr: Array<quest.QuestTaskVo> = quest.QuestModel.getInstance().getOtherTaskVo();
                        for (var i: number = 0; i < $arr.length; i++) {
                            if (quest.QuestModel.TrackDic[$arr[i].id] && $arr[i].tb_quest.ctype == $item[j].tab_adventure.type && $arr[i].tb_quest.ctype == 2) { //2特指押镖。如果有新添加需要在这里处理
                             
                                if (this.taskItem.length) {
                                    this._taskTy = -150;
                                } else {
                                    this._taskTy = 0;
                                }
                                this.taskItem.push($arr[i])
                            }
                        }
                        this.taskItem.push($dailyQuestTaskVo);
                    }

                }
            }
         
     
        }
        private getItemShow(): void {
            this.taskItem = new Array();
            var $dailyQuestTaskVo: quest.QuestTaskVo = quest.QuestModel.getInstance().getDailyQuestVoTemp();
            if ($dailyQuestTaskVo) {
                this.taskItem.push($dailyQuestTaskVo)
            }
            var $arr: Array<quest.QuestTaskVo> = quest.QuestModel.getInstance().getOtherTaskVo();
            for (var i: number = 0; i < $arr.length; i++) {
         
                if (quest.QuestModel.TrackDic[$arr[i].id] && $arr[i].tb_quest.ctype!=2) {
                    this.taskItem.push($arr[i])
                }
            }
            if (this.taskItem.length > 1) {
                this.taskItem.sort(function (a: quest.QuestTaskVo, b: quest.QuestTaskVo): number {
                    if (b.tb_quest.type != a.tb_quest.type) {
                        return b.tb_quest.type - a.tb_quest.type;
                    } else {
                        if (a.finish != b.finish) {
                            return a.finish == b.finish ? 0 : 1;
                        } else {
                            return b.tb_quest.id - a.tb_quest.id;
                        }
                    }
                })
            }


        }
        private testFinish(): void {

            for (var i: number = 0; i < this.taskItem.length; i++) {
                var $taskVo: quest.QuestTaskVo = this.taskItem[i]
                if ($taskVo.finish) {
                    quest.QuestModel.getInstance().pick_quest_reward($taskVo)
                }
            }
        }
        private drawTempTask($ctx: CanvasRenderingContext2D, $taskVo: quest.QuestTaskVo, ty: number): number {
            var $uiScale: number = TaskListUi.taskUiScale15;
            var $itemStrList: Array<string> = quest.QuestModel.getInstance().getTaskStrItemByTaskVo($ctx, $taskVo)

            var $bgRect: Rectangle = new Rectangle(0, ty, 200, 52);
            // $bgRect.y = ty * $uiScale;
            $bgRect.width = 200 * $uiScale;
            $bgRect.height = ($taskVo.textRectHeight * 20 + 18) * $uiScale;

            $taskVo.clikRect = $bgRect;
            TaskListUi.drawTaskBgRect($ctx, $bgRect);
            var $iconName: string 
            if ($taskVo.meshBossVo) {
                $iconName = "A_quest_ion3"
                ty+=5
            } else {
                 $iconName = quest.QuestModel.getIconNameById($taskVo.tb_quest.showpage)
            }
       
      
            UiDraw.cxtDrawImg($ctx, $iconName, new Rectangle(4 * $uiScale, ty + 5 * $uiScale, 24 * $uiScale, 24 * $uiScale), UIData.publicUi);


            var $kto: number = 0
            for (var i: number = 0; i < $itemStrList.length; i++) {

                var tx: number = 8
                if (i == 0) {
                    tx += 21
                }


                var ttyy: number = ty + ($kto * 20 + 10) * $uiScale;
                if (i == 0) {
                    ttyy -= (2 * $uiScale)
                }
                $kto += $taskVo.textrectH[i]
                TextRegExp.defaultColor = "#d8d49c";
                var $lineWidth225: number = quest.QuestModel.lineWidth225
                $ctx.font = (true ? "bolder " : "") + " " + 14 * $uiScale + "px " + UIData.font;
                TextRegExp.wrapText($ctx, $itemStrList[i], "#d8d49c", tx * $uiScale, ttyy, $lineWidth225, 20 * $uiScale, 14 * $uiScale, "#27262e");
                //LabelTextFont.writeSingleLabelToCtx($ctx, "cccav", 30, tx * $uiScale, ttyy)
                if (i == 0 && $taskVo.finish) {
                    var $textMetrics: TextMetrics = TextRegExp.getTextMetrics($ctx, $itemStrList[i]);
                    UiDraw.cxtDrawImg($ctx, PuiData.A_quest_finish, new Rectangle((tx + $textMetrics.width / $uiScale + 10) * $uiScale, ttyy - 5, 36 * $uiScale, 21 * $uiScale), UIData.publicUi);
                }
            }
            return ($taskVo.textRectHeight * 20);
        }

        public static taskUiScale15: number = 1.5;



        public static drawTaskBgRect($ctx: CanvasRenderingContext2D, $bgRect: Rectangle): void {
            var $uiScale: number = TaskListUi.taskUiScale15;
            UiDraw.cxtDrawImg($ctx, PuiData.A_quest_top, new Rectangle(0, $bgRect.y + 0, $bgRect.width, 10 * $uiScale), UIData.publicUi);
            UiDraw.cxtDrawImg($ctx, PuiData.A_quest_mid, new Rectangle(0, $bgRect.y + 10 * $uiScale, $bgRect.width, $bgRect.height - 20 * $uiScale - 2 * $uiScale), UIData.publicUi);
            UiDraw.cxtDrawImg($ctx, PuiData.A_quest_bottom, new Rectangle(0, $bgRect.y + $bgRect.height - 10 * $uiScale - 2 * $uiScale, $bgRect.width, 10 * $uiScale), UIData.publicUi);
        }

        private _taskTy: number = 0;
        public set taskTy(value: number) {
            this._taskTy = value;
            var $knum: number = this.bg.height * TaskListUi.taskUiScale15 - this.totalH;
            this._taskTy = Math.max($knum, this._taskTy);
            this._taskTy = Math.min(this._taskTy, 0);

           // //console.log("this._taskTy ", this._taskTy )

            this.resize()
        }
        public resize(): void {

            if (isNaN(this.baseBgrenderY)) {
                this.baseBgrenderY = this.bg.renderData2[3]
            }
            this.bg.renderData2[3] = this.baseBgrenderY - this._taskTy / 2048;
            this.bg.renderData2[0] = (this.bg.width / 512) * TaskListUi.taskUiScale15;
            this.bg.renderData2[1] = (this.bg.height / 2048) * TaskListUi.taskUiScale15;
            this.bg.uiRender.makeRenderDataVc(this.bg.vcId);

        }
        private baseBgrenderY: number
        public get taskTy(): number {
            return this._taskTy;
        }
        public clikUp(evt: InteractiveEvent): void {
            //  var $uiScale: number = TaskListUi.taskUiScale15;
            if (UIManager.getInstance().disMoveNnum(new Vector2D(evt.x, evt.y), 5)) {
                var $mouseY: number = (evt.y / UIData.Scale) - (this.bg.y + this.perent.y / UIData.Scale) - this._taskTy / TaskListUi.taskUiScale15;
                $mouseY = ($mouseY * TaskListUi.taskUiScale15);
                for (var i: number = 0; i < this.taskItem.length; i++) {
                    if ($mouseY > this.taskItem[i].clikRect.y && $mouseY < this.taskItem[i].clikRect.y + this.taskItem[i].clikRect.height) {
                        var ty = ($mouseY - this.taskItem[i].clikRect.y) / TaskListUi.taskUiScale15
                        if (this.taskItem[i].meshBossVo) {
            
                            this.clikMeshBossVo(this.taskItem[i].meshBossVo)
                        } else {
                            quest.QuestModel.getInstance().clikTaskVoCell(this.taskItem[i], Math.floor((ty - 10) / 20));
                        }
                        break;
                    }

                }
            }
        }
        private clikMeshBossVo(meshBossVo: sboss.MeshBossVo): void {
            //console.log(meshBossVo)

            var item: Array<Vector2D> = AstarUtil.findPath2D(GameInstance.mainChar.getAstarPos(), new Vector2D(meshBossVo.tb.bossPos[0], meshBossVo.tb.bossPos[1]));
            if (item && item.length) {
                MainCharControlModel.getInstance().setWalkPathFun(item, () => {
                    AotuSkillManager.getInstance().aotuBattle = true
                });
            }
        }

    }
    export class QuestMainCell {
        private ui: UICompenent;
        public rewardUi: UICompenent
        private uiAtlas: UIAtlas
        public constructor($ui: UICompenent, $uiAtlas: UIAtlas) {
            this.ui = $ui;
            this.uiAtlas = $uiAtlas
        }
        public nextTy: number = 0;
        public refresh(): void {
            var $taskVo: quest.QuestTaskVo = quest.QuestModel.getInstance().getMainTaskVo();
            if ($taskVo) {
                // //console.log("主线任务ID", $taskVo.id, $taskVo)
                this.ui.data = $taskVo;
                var rec: UIRectangle = this.uiAtlas.getRec(this.ui.skinName);
                var $ctx: CanvasRenderingContext2D = UIManager.getInstance().getContext2D(100, 100);
                quest.QuestModel.getInstance().getTaskStrItemByTaskVo($ctx, $taskVo);
                this.drawTaskBgToCtx($taskVo);
                if ($taskVo.finish) {
                    quest.QuestModel.getInstance().pick_quest_reward($taskVo);
                }
                this.nextTy = this.ui.y + $taskVo.textRectHeight * 20 + 13;

                this.drawRewards($taskVo)
            }
        }
        private drawRewards($taskVo: quest.QuestTaskVo): void {


            if ($taskVo.tb_quest.icon.length) {
                //   GameData.drawEquToSkinName(this.rewardUi.skinName, $taskVo.tb_quest.icon[0], 1, this.uiAtlas);

                LoadManager.getInstance().load(Scene_data.fileRoot + GameData.getIconCopyUrl($taskVo.tb_quest.icon[0]), LoadManager.IMG_TYPE,
                    ($img: any) => {
                        var $skillrec: UIRectangle = this.uiAtlas.getRec(this.rewardUi.skinName);
                        var $ctx: CanvasRenderingContext2D = UIManager.getInstance().getContext2D($skillrec.pixelWitdh, $skillrec.pixelHeight, false);
                        UiDraw.cxtDrawImg($ctx, PuiData.REWARD_BG1, new Rectangle(0, 0, $skillrec.pixelWitdh, $skillrec.pixelHeight), UIData.publicUi);
                        $ctx.drawImage($img, 3, 3, $skillrec.pixelWitdh - 6, $skillrec.pixelHeight - 6);
                        this.uiAtlas.updateCtx($ctx, $skillrec.pixelX, $skillrec.pixelY);
                    });
            } else {
                this.uiAtlas.clearCtxTextureBySkilname(this.rewardUi.skinName);
            }

        }
        private drawTaskBgToCtx($taskVo: quest.QuestTaskVo): void {
            var $uiScale: number = TaskListUi.taskUiScale15;
            var $itemStrList: Array<string> = $taskVo.itemStrList

            var $bgRect: Rectangle = new Rectangle(0, 0, 200, 52);
            $bgRect.width = (200) * $uiScale
            $bgRect.height = ($taskVo.textRectHeight * 20 + 18) * $uiScale

            var rec: UIRectangle = this.uiAtlas.getRec(this.ui.skinName);
            var $ctx: CanvasRenderingContext2D = UIManager.getInstance().getContext2D($bgRect.width, $bgRect.height, false);


            TaskListUi.drawTaskBgRect($ctx, $bgRect);
            UiDraw.cxtDrawImg($ctx, PuiData.A_quest_ion0, new Rectangle(4 * $uiScale, 3 * $uiScale, 24 * $uiScale, 24 * $uiScale), UIData.publicUi);

            var $kto: number = 0
            for (var i: number = 0; i < $itemStrList.length; i++) {
                var tx: number = 8
                if (i == 0) {
                    tx += 21
                }

                $ctx.font = (true ? "bolder " : "") + " " + 14 * $uiScale + "px " + UIData.font;
                var ttyy: number = ($kto * 20 + 8) * $uiScale
                if (i == 0) {
                    ttyy -= (2 * $uiScale)
                }

                $kto += $taskVo.textrectH[i]
                TextRegExp.defaultColor = "#d8d49c";
                var $lineWidth225: number = quest.QuestModel.lineWidth225
                TextRegExp.wrapText($ctx, $itemStrList[i], "#d8d49c", tx * $uiScale, ttyy, $lineWidth225, 20 * $uiScale, 14 * $uiScale, "#27262e");
                if (i == 0 && $taskVo.finish) {
                    var $textMetrics: TextMetrics = TextRegExp.getTextMetrics($ctx, $itemStrList[i]);
                    UiDraw.cxtDrawImg($ctx, PuiData.A_quest_finish, new Rectangle((tx + $textMetrics.width / $uiScale + 10) * $uiScale, 8 * $uiScale, 36 * $uiScale, 21 * $uiScale), UIData.publicUi);
                }
            }

            TextureManager.getInstance().updateTexture(this.uiAtlas.texture, rec.pixelX, rec.pixelY, $ctx);

            this.ui.width = $bgRect.width / $uiScale;
            this.ui.height = $bgRect.height / $uiScale;


        }
    }

    export class LeftUiQuestPanel extends UIPanel {

        private _topRender: UIRenderComponent;
        private _effRender: FrameUIRender;

        public constructor() {
            super();
            this.interfaceUI = true
            this.width = UIData.designWidth;
            this.height = UIData.designHeight;
            this.middle = 0;
            this.left = 0;

            this._topRender = new UIRenderComponent;
            this.addRender(this._topRender)
            this._topRender.uiAtlas = new UIAtlas();

            this._effRender = new FrameUIRender;
            this.addRender(this._effRender);

        }
        private bFun: Function;
        public loadAtlas($bfun: Function): void {
            this.bFun = $bfun
            this._topRender.uiAtlas.setInfo("ui/uidata/mainui/left/leftquest/leftquest.xml", "ui/uidata/mainui/left/leftquest/leftquest.png", () => { this.loadConfigCom() });
        }
        private questMainCell: QuestMainCell
        private lc_main_cell: UICompenent;
        private taskListUi: TaskListUi;
        private _effUI: FrameTipCompenent;
        private loadConfigCom(): void {

            this.lc_main_cell = this.addEvntButUp("a_main_cell", this._topRender)
            this.lc_main_cell.addEventListener(InteractiveEvent.Down, this.butClikUCellUp, this);

            this.questMainCell = new QuestMainCell(this.lc_main_cell, this._topRender.uiAtlas);
            this.questMainCell.rewardUi = this.addEvntBut("a_reward", this._topRender)

            this.taskListUi = new TaskListUi(this, this._topRender.uiAtlas)
            this.taskListUi.bg = this.addChild(this._topRender.getComponent("a_list_cell"));
            this.taskListUi.bg.addEventListener(InteractiveEvent.Down, this.a_list_cellMouseEvet, this);
            this.taskListUi.bg.addEventListener(InteractiveEvent.Up, this.a_list_cellMouseEvet, this);

            if (this.bFun) {
                this.bFun();
            }
            this.refresh();

            this._effRender.setImg(getEffectUIUrl("ui_rw_01"), 4, 4, ($ui: any) => {
                this._effUI = $ui;
                this._effUI.x = this.lc_main_cell.x - 18;
                this._effUI.y = this.lc_main_cell.y - 27;
                //this.expEff.width = this.expEff.baseRec.width * 1.5;
                //this.upLevEff.height = this.upLevEff.baseRec.height * 0.8;
                this._effUI.speed = 5;
                this._effUI.play();
                //this.addChild(this._effUI);
                this.refreshEff();
            })

        }

        public refreshEff(): void {
            if(!this._effUI){
                return;
            }
            var qv: quest.QuestTaskVo = quest.QuestModel.getInstance().getMainTaskVo()
            if (qv && qv.tb_quest&&qv.tb_quest.flag == 2 && qv.finish) {
                this.addChild(this._effUI)
            }else{
                this.removeChild(this._effUI);
            }
        }
        
        private a_list_cellMouseEvet(evt: InteractiveEvent): void {
            UIManager.popClikNameFun("a_list_cell");
            switch (evt.target) {
                case this.taskListUi.bg:
                    if (evt.type == InteractiveEvent.Down) {
                        GameMouseManager.moveQuestCell = true
                        this.taskListMouseDown(evt)
                    } else {
                        this.taskListUi.clikUp(evt)
                    }
                    break
                default:
                    break
            }

         

        }
        private butClikUCellUp(evt: InteractiveEvent): void {

        }
        public refresh(): void {
            // if (this.questMainCell) {
                this.questMainCell.refresh();
            // }
            if (TaskListUi.showType == 0) {
                this.lc_main_cell.x = 42;
                this.taskListUi.bg.y = this.questMainCell.nextTy;
            } else {
                this.lc_main_cell.x = -999;
                this.taskListUi.bg.y = 140;
            }
            this.taskListUi.refresh();
            this._topRender.applyObjData();
            this.refreshEff();
            this.resize()
            
        }
        public refreshType(value: number): void {
            this.refresh();
        }
        public resize(): void {
            super.resize();
            this.lc_main_cell.renderData2[0] = (this.lc_main_cell.width / 512) * TaskListUi.taskUiScale15;
            this.lc_main_cell.renderData2[1] = (this.lc_main_cell.height / 2048) * TaskListUi.taskUiScale15;
            this.lc_main_cell.uiRender.makeRenderDataVc(this.lc_main_cell.vcId);
            this.taskListUi.resize();
        }

        protected butClik(evt: InteractiveEvent): void {
            UIManager.popClikNameFun("a_list_cell");
            switch (evt.target) {
                case this.lc_main_cell:
                    if (evt.type == InteractiveEvent.Up && this.left == 0) {
                        UIManager.popClikNameFun("lc_main_cell");

                        var aaa:quest.QuestTaskVo = this.lc_main_cell.data;
                        if(aaa.tb_quest){

                        }
                        if (UIManager.getInstance().disMoveNnum(new Vector2D(evt.x, evt.y), 5)) {
                            var ty: number = evt.y - (this.lc_main_cell.y * UIData.Scale + this.y)
                            ty = ty / UIData.Scale
                            quest.QuestModel.getInstance().clikTaskVoCell(this.lc_main_cell.data, Math.floor((ty - 10) / 20))
                        }
                    }
                    break;

                default:
                    break
            }
        }


        private _lastMouseY: number = 0;
        private _lastFriendTy: number = 0;
        private _isMoveBar: boolean = false
        private taskListMouseDown(evt: InteractiveEvent): void {
            this._isMoveBar = false
            this._lastMouseY = evt.y;
            this._lastFriendTy = this.taskListUi.taskTy
            Scene_data.uiStage.addEventListener(InteractiveEvent.Move, this.onStageMouseMove, this);
            Scene_data.uiStage.addEventListener(InteractiveEvent.Up, this.onStageMouseUp, this);

        }
        private onStageMouseMove(evt: InteractiveEvent): void {
            this._isMoveBar = true
            this.taskListUi.taskTy = this._lastFriendTy + (evt.y - this._lastMouseY);
 
        }
        private onStageMouseUp(evt: InteractiveEvent): void {
            Scene_data.uiStage.removeEventListener(InteractiveEvent.Move, this.onStageMouseMove, this);
            Scene_data.uiStage.removeEventListener(InteractiveEvent.Up, this.onStageMouseUp, this);
            this._isMoveBar = false
        }

        public show(): void {
            UIManager.getInstance().addUIContainer(this);
  
        }
        public hide(): void {
             UIManager.getInstance().removeUIContainer(this);

        }
        //private showTab0(): void {
        //    this.lc_main_cell.x = 42
        //    this.taskListUi.bg.y = this.questMainCell.nextTy;
        //    this.resize()
        //}
        //private showTab1(): void {
        //    this.lc_main_cell.x = -999
        //    this.taskListUi.bg.y = 139
        //    this.resize()
        //}


    }

}