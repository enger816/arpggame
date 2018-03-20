﻿module treasure {
    export class TreasureUiModule extends Module {
        public getModuleName(): string {
            return "TreasureUiModule";
        }
        protected listProcessors(): Array<Processor> {
            return [new TreasureProcessor()];
        }
    }
    export class TreasureUiEvent extends BaseEvent {
        //展示法宝面板
        public static SHOW_TREASURE_EVENT: string = "SHOW_TREASURE_EVENT";
        //隐藏法宝面板
        public static HIDE_TREASURE_EVENT: string = "HIDE_TREASURE_EVENT";
        //选中item
        public static SELECT_ITEM_EVENT: string = "SELECT_ITEM_EVENT";
        //解锁法宝
        public static UNLOCK_WEAPON_EVENT: string = "UNLOCK_WEAPON_EVENT";
        //更新法宝数据
        public static CHANGE_WEAPON_EVENT: string = "CHANGE_WEAPON_EVENT";
        //总战力变化
        public static CHANGE_ZHANLI_EVENT: string = "CHANGE_ZHANLI_EVENT";
        //装备槽变化
        public static CHANGE_SLOT_EVENT: string = "CHANGE_SLOT_EVENT";

        public static SHOW_TIPS_EVENT: string = "SHOW_TIPS_EVENT";
        public data: any
    }

    export class TreasureProcessor extends BaseProcessor {
        private _treasureUiPanel: TreasureUiPanel

        public getName(): string {
            return "TreasureProcessor";
        }
        protected receivedModuleEvent($event: BaseEvent): void {

            if ($event instanceof TreasureUiEvent) {
                this.processRedPoint();
                var $uiEvent: TreasureUiEvent = <TreasureUiEvent>$event;
                if ($uiEvent.type == TreasureUiEvent.SHOW_TREASURE_EVENT) {
                    this.showUi($uiEvent.data);
                } else if ($uiEvent.type == TreasureUiEvent.HIDE_TREASURE_EVENT) {
                    this.hideUi()
                } else if ($uiEvent.type == TreasureUiEvent.SELECT_ITEM_EVENT) {
                    this.selectitem($uiEvent.data);
                } else if ($uiEvent.type == TreasureUiEvent.UNLOCK_WEAPON_EVENT) {
                    this.unlockweapon();
                } else if ($uiEvent.type == TreasureUiEvent.CHANGE_WEAPON_EVENT) {
                    this.unlockweapon();
                } else if ($uiEvent.type == TreasureUiEvent.SHOW_TIPS_EVENT) {
                    this.showTips($uiEvent.data);
                } else if ($uiEvent.type == TreasureUiEvent.CHANGE_SLOT_EVENT) {
                    this.chgslotevent();

                } else if ($uiEvent.type == TreasureUiEvent.CHANGE_ZHANLI_EVENT) {
                    this.changezhanli();
                }
            } else if ($event.type == EngineEvent.CORE_DATA_COMPLETE_EVENT) {
                //红点初始化
                this.initRedNode();
            } else if ($event.type == EngineEvent.MONEY_CHANGE || $event.type == EngineEvent.SYSTEM_OPEN_EVENT) {
                this.processRedPoint();
            }

            if ($event instanceof charbg.CharBgEvent) {
                if ($event.type == charbg.CharBgEvent.BGDATA_CHANGE_EVENT) {
                    // if(this._needItem){
                    //     if(this.isNeedItem((<charbg.CharBgEvent>$event).change)){
                    //         this.processRedPoint();
                    //         this.refreshCost();
                    //     }
                    // }else{
                    this.processRedPoint();
                    this.refreshCost();
                    // }
                }
            }

            if ($event instanceof UIPanelEvent) {
                var panelEvent: UIPanelEvent = <UIPanelEvent>$event;
                if (panelEvent.panel == this._treasureUiPanel) {
                    var nodeList = RedPointManager.getInstance().getNodeByID(133).children;
                    for (var i = 0; i < nodeList.length; i++) {
                        nodeList[i].unBind();
                    }

                    this._treasureUiPanel.dispose();
                    this._treasureUiPanel = null;
                    //console.log("释放面板 _treasureUiPanel")
                }
            }
        }

        // private isNeedItem($chgary:Array<number>):boolean{
        //     if($chgary){
        //         for (let i = 0; i < $chgary.length; i++) {
        //             var hasflag = this._needItem.indexOf($chgary[i]);
        //             if(hasflag != -1){
        //                 return true;
        //             }
        //         }
        //     }
        //     return false;
        // }


        // private _needItem:Array<number>


        private _nodeInit: boolean = false;
        private initRedNode(): void {
            if (this._nodeInit) {
                return;
            }
            var pnode: RedPointNode = RedPointManager.getInstance().getNodeByID(133);

            var $arr: Array<TreasureItemVo> = TreasureModel.getInstance().getList();
            for (var i: number = 0; i < $arr.length; i++) {
                var node: RedPointNode = new RedPointNode();
                node.data = $arr[i];
                pnode.addChild(node);
            }

            this._nodeInit = true;

            this.processRedPoint();
        }

        private processRedPoint(): void {
            // if(!this._needItem){
            //     this._needItem = new Array
            // }
            if (GuidData.player.getsyspageopen(SharedDef.MODULE_DIVINE, SharedDef.MODULE_DIVINE_ALL)) {
                var ary: Array<RedPointNode> = RedPointManager.getInstance().getNodeByID(133).children;
                for (var i: number = 0; i < ary.length; i++) {
                    var obj: TreasureItemVo = ary[i].data;
                    if (obj.state == 2) {
                        //激活操作
                        var $ary = obj.tabvo.avtivedata[0]

                        // if(this._needItem.indexOf($ary[0]) == -1){
                        //     this._needItem.push($ary[0]);
                        // }
                        if (hasEnoughResItem($ary)) {
                            ary[i].show = true;
                        } else {
                            ary[i].show = false;
                        }
                    } else {
                        var spirittabary: Array<tb.TB_talisman_spirit> = tb.TB_talisman_spirit.get_TB_talisman_spiritByIdArray(obj.tabvo.id);
                        var nextlev = obj.activityvo.lev + 1;
                        if (nextlev > spirittabary[spirittabary.length - 1].level) {
                            //满级
                            ary[i].show = false;
                        } else {
                            //升级
                            var nextlevtab = spirittabary[nextlev - 1];
                            var $ary1 = nextlevtab.item_cost[0]
                            // if(this._needItem.indexOf($ary1[0]) == -1){
                            //     this._needItem.push($ary1[0]);
                            // }
                            // if(this._needItem.indexOf($ary2[0]) == -1){
                            //     this._needItem.push($ary2[0]);
                            // }
                            if (hasEnoughResItem($ary1)) {
                                ary[i].show = true;
                            } else {
                                ary[i].show = false;
                            }
                        }
                    }
                }
            }

            if (GuidData.player.getsyspageopen(SharedDef.MODULE_DIVINE, SharedDef.MODULE_DIVINE_USE)) {
                var node: RedPointNode = RedPointManager.getInstance().getNodeByID(132);
                var treasureWearVo: Array<TreasureWearVo> = GuidData.grow.gettalismanslotlist();
                var $arr: Array<TreasureVo> = TreasureModel.getInstance().getTreasureList();
                if ($arr.length > 0) {
                    for (let i = 0; i < treasureWearVo.length; i++) {
                        //先判断有没有可以装备的位置
                        if (treasureWearVo[i].state == 1 && treasureWearVo[i].treasureid == 0) {
                            node.show = true;
                            return;
                        }
                    }
                }
                node.show = false;
            }
        }

        private chgslotevent() {
            if (this._treasureUiPanel && this._treasureUiPanel.treasureWear && this._treasureUiPanel.treasureWear.hasStage) {
                this._treasureUiPanel.treasureWear.chgslot();
            }
            if (this._treasureUiPanel && this._treasureUiPanel.treasureWear && this._treasureUiPanel.treasureWear.wearList && this._treasureUiPanel.treasureWear.wearList.hasStage) {
                this._treasureUiPanel.treasureWear.wearList.refreshDataByNewData();
            }
            if (this._treasureUiPanel && this._treasureUiPanel.treasurePage && this._treasureUiPanel.treasurePage.treasureRightPanel && this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList && this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList.hasStage) {
                this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList.refreshDataByNewData();
            }
        }


        private refreshCost() {
            if (this._treasureUiPanel && this._treasureUiPanel.treasurePage && this._treasureUiPanel.treasurePage.treasureRightPanel && this._treasureUiPanel.treasurePage.treasureRightPanel.hasStage) {
                this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList.refreshDataByNewData();
            }
        }

        private changezhanli() {
            if (this._treasureUiPanel && this._treasureUiPanel.treasurePage && this._treasureUiPanel.treasurePage.hasStage) {
                this._treasureUiPanel.treasurePage.setZhanli();
            }
        }

        private unlockweapon() {
            if (this._treasureUiPanel && this._treasureUiPanel.treasurePage && this._treasureUiPanel.treasurePage.treasureRightPanel && this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList && this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList.hasStage) {
                this._treasureUiPanel.treasurePage.treasureRightPanel.treasureList.refreshDataByNewData();
            }
        }
        // private changeweapon() {
        //     if(this._treasureUiPanel && this._treasureUiPanel.treasureRightPanel && this._treasureUiPanel.treasureRightPanel.treasureList && this._treasureUiPanel.treasureRightPanel.treasureList.hasStage){
        //         this._treasureUiPanel.treasureRightPanel.treasureList.refreshDataByNewDataCopy();
        //     }
        // }

        private selectitem($data: SListItemData) {
            if (this._treasureUiPanel && this._treasureUiPanel.treasurePage && this._treasureUiPanel.treasurePage.treasureRightPanel) {
                this._treasureUiPanel.treasurePage.treasureRightPanel.resetData($data.data);
            }
        }

        private hideUi(): void {
            this._treasureUiPanel.hide();
            ModuleEventManager.dispatchEvent(new mainUi.MainUiEvent(mainUi.MainUiEvent.SHOW_MAINUI_EVENT));
        }

        private showUi($data: any): void {
            if (!this._treasureUiPanel) {
                this._treasureUiPanel = new TreasureUiPanel();
            }
            this._treasureUiPanel.load(() => {
                //停止绘制前面的ui
                SceneManager.getInstance().render = false;
                ModuleEventManager.dispatchEvent(new mainUi.MainUiEvent(mainUi.MainUiEvent.HIDE_MAINUI_EVENT));

                if ($data) {
                    if ($data instanceof Array) {
                        $data = $data[0]
                    }
                } else {
                    $data = SharedDef.MODULE_DIVINE_ALL;
                }
                this._treasureUiPanel.show($data);

                var $scenePange: msgtip.MsgTipEvent = new msgtip.MsgTipEvent(msgtip.MsgTipEvent.SHOW_PAGE_POP_VIEW)
                $scenePange.data = SharedDef.MODULE_DIVINE
                ModuleEventManager.dispatchEvent($scenePange);
            });
        }

        private treasureTip: TreasureTip
        private showTips($data: cilckVo): void {
            if (!this.treasureTip) {
                this.treasureTip = new TreasureTip();
            }
            // this.treasureTip.load(() => {
            this.treasureTip.show($data.id, $data.type);
            // });
        }


        protected listenModuleEvents(): Array<BaseEvent> {
            return [
                new TreasureUiEvent(TreasureUiEvent.SHOW_TREASURE_EVENT),
                new TreasureUiEvent(TreasureUiEvent.HIDE_TREASURE_EVENT),
                new TreasureUiEvent(TreasureUiEvent.SELECT_ITEM_EVENT),
                new TreasureUiEvent(TreasureUiEvent.UNLOCK_WEAPON_EVENT),
                new TreasureUiEvent(TreasureUiEvent.CHANGE_WEAPON_EVENT),
                new TreasureUiEvent(TreasureUiEvent.CHANGE_ZHANLI_EVENT),
                new TreasureUiEvent(TreasureUiEvent.CHANGE_SLOT_EVENT),
                new TreasureUiEvent(TreasureUiEvent.SHOW_TIPS_EVENT),

                new UIPanelEvent(UIPanelEvent.DISPOSE_PANEL_EVENT),
                new charbg.CharBgEvent(charbg.CharBgEvent.BGDATA_CHANGE_EVENT),
                new EngineEvent(EngineEvent.CORE_DATA_COMPLETE_EVENT),
                new EngineEvent(EngineEvent.MONEY_CHANGE),
                new EngineEvent(EngineEvent.SYSTEM_OPEN_EVENT),
            ];
        }
    }

}