﻿
class InputPanel extends UIConatiner {

    private _bottomRender: UIRenderComponent;
    private _midRender: UIRenderComponent;
    private _topRender: UIRenderComponent;

    constructor() {
        super();

        this.layer=10000
        this._bottomRender = new UIRenderComponent();
        this.addRender(this._bottomRender);

        this._midRender = new UIRenderComponent();
        this.addRender(this._midRender);

        this._topRender = new UIRenderComponent();
        this.addRender(this._topRender);
        //this.makePanelUi();

        GameData.getPublicUiAtlas(($uiAtlas: UIAtlas) => { this.makePanelUi($uiAtlas) });
    }
  
    private textureRect: Rectangle = new Rectangle(0, 0, 256, 256)


    private makePanelUi($uiAtlas: UIAtlas): void
    {
        this._bottomRender.uiAtlas = $uiAtlas;
        this._midRender.uiAtlas = $uiAtlas;
        this._topRender.uiAtlas = $uiAtlas;

        this.winBg = this.addEvntBut("bg_black", this._bottomRender);
        this.winBg.addEventListener(InteractiveEvent.Up, this.butClik, this);
        this.guiBg = this.addEvntButUp("input_bg", this._midRender);

        this.buta = this.addEvntButUp("input_a0", this._midRender);
        this.butb = this.addEvntButUp("input_a1", this._midRender);




        this.winBg.x = 0;
        this.winBg.y = 0;

        this.uiAtlasComplet = true;

        this.resize();

    }
    private guiBg:UICompenent
    private buta: UICompenent
    private butb: UICompenent
    private winBg:UICompenent
 
    private bFun: Function;
    public lastVerticalState: Boolean = false
    private initData($bfun: Function, $msg: string): void {
        this.width = UIData.designWidth;
        this.height = UIData.designHeight;
        this.top = 0
        this.left = 0
        this.bFun = $bfun

        this.lastVerticalState = Engine.needVertical
        Engine.needVertical = false;
        Engine.resetSize();


        this.setHtmlInputVisible(true)

        this.chatHtmlInput.value = $msg;
  
   
    }
    private chatHtmlInput: HTMLTextAreaElement;
    private setInputTxtPos(): void {
        if (!this.chatHtmlInput) {
            this.chatHtmlInput = document.createElement("textarea")
       //     this.chatHtmlInput.type = "text";
            this.chatHtmlInput.style.position = "absolute";
            this.chatHtmlInput.style["z-index"] = 100
            this.chatHtmlInput.style.background = "transparent"
            this.chatHtmlInput.style.color = "#40120a";
            document.body.appendChild(this.chatHtmlInput);

            //ColorType.Brown40120a
        }

        this.chatHtmlInput.style.left = "10px";

        var tx: number = 0
        var ty: number = 0
        var tw: number = Scene_data.stageWidth-20
        var th: number = 280;
        var textSize:number=100
        if (Scene_data.isPc) {
            this.chatHtmlInput.style.fontSize = String(Math.floor(textSize * 0.9)) + "px";
        } else {
            this.chatHtmlInput.style.fontSize = String(Math.floor(textSize * 0.5)) + "px";
        }
        this.chatHtmlInput.style.width = String(tw) + "px";
        this.chatHtmlInput.style.height = String(th) + "px";

   
 

    }
    private setHtmlInputVisible(value: boolean): void {
        if (value) {
            this.setInputTxtPos()
        } else {
            if (this.chatHtmlInput && this.chatHtmlInput.parentElement) {
                this.chatHtmlInput.style.left =  "9000px";
            }
        }
    }
    private uiAtlasComplet:boolean=false
    public resize(): void {

        if (this.uiAtlasComplet) {
            this.winBg.width = Scene_data.stageWidth / UIData.Scale;
            this.winBg.height = Scene_data.stageHeight / UIData.Scale;
            this.setHtmlInputVisible(true)

            this.buta.y = 350 / UIData.Scale
            this.buta.x = Scene_data.stageWidth / 3 / UIData.Scale - this.buta.width/2;

            this.butb.y = 350 / UIData.Scale
            this.butb.x = Scene_data.stageWidth / 3 / UIData.Scale * 2 - this.buta.width / 2;

            this.guiBg.x = 0
            this.guiBg.y = 0
            this.guiBg.width = Scene_data.stageWidth /UIData.Scale-0
            this.guiBg.height = 300 / UIData.Scale-10



            this._bottomRender.applyObjData();
            this._midRender.applyObjData();
            this._topRender.applyObjData();
        }
        super.resize();
    }
    private barB: UICompenent;
    private barC: UICompenent;

    private resetsize(d: number): void {
        this._topRender.applyObjData();
        this._midRender.applyObjData();
    }
    protected butClik(evt: InteractiveEvent): void {

        switch (evt.target) {
            case this.butb:
                this.bFun(this.chatHtmlInput.value)
                this.close();
                break
            case this.buta:
                this.close();
                break
            default:
                break;
        }

        
    }
    public onRemove(): void {
        if (this.chatHtmlInput) {
            console.log("清除input")
            this.chatHtmlInput.style.left = "9999px";
        }
    }
    private close(): void {
        this.setHtmlInputVisible(false)
        UIManager.getInstance().removeUIContainer(this);
        Engine.needVertical = this.lastVerticalState
        Engine.resetSize();
    }

    private static inputPanel: InputPanel
    /**
     * $type:0 任何字符  1：纯数字 2：纯文本
     * $lengths：字符串长度
     */
    public static show($bfun:Function,$msg:string,$type:number = 0,$lengths:number = 100): InputPanel {
        if (!this.inputPanel) {
            this.inputPanel = new InputPanel();
        }
     
        this.inputPanel.initData($bfun, $msg);
        UIManager.getInstance().addUIContainer(this.inputPanel);
        return this.inputPanel;
    }
    public static hasPanel(): boolean {
        if (this.inputPanel && this.inputPanel.hasStage) {
            return true
        } else {
            return false
        }
    }

}