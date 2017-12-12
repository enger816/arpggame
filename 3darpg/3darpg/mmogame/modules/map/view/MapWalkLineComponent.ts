﻿
module map {
    export class MapWalkLineShader extends Shader3D {
        static MapWalkLineShader: string = "MapWalkLineShader";
        constructor() {
            super();
        }
        binLocation($context: WebGLRenderingContext): void {
            $context.bindAttribLocation(this.program, 0, "v4Pos");
        }
        getVertexShaderString(): string {
            var $str: string =
                "attribute vec4 v4Pos;" +
                "void main(void)" +
                "{" +
                "   vec4 vt0= vec4(v4Pos.x,v4Pos.y,0, 1.0);" +
                "   gl_Position = vt0;" +
                "}"
            return $str
        }
        getFragmentShaderString(): string {
            var $str: string =
                "precision mediump float;\n" +
                "void main(void)\n" +
                "{\n" +
                      "gl_FragColor = vec4(0.6,0.0,0.0, 1.0);\n" +
                "}"
            return $str;
        }

    }
    export class MapLineUi extends UICompenent{

        public constructor() {
            super();
            this.x = UIData.designWidth/2;
            this.y = UIData.designHeight / 2;
            this.width = 20;
            this.height = 20;
        }
        public applyRenderSize(): void {
        }
    }
    export class MapWalkLineComponent extends UIRenderComponent {
        public constructor() {
            super();
            ProgrmaManager.getInstance().registe(MapWalkLineShader.MapWalkLineShader, new MapWalkLineShader)
            this.shader = ProgrmaManager.getInstance().getProgram(MapWalkLineShader.MapWalkLineShader);
            this.program = this.shader.program;



        }
        public makeLineUiItem($arr: Array<Vector2D>): void {
            if ($arr&&$arr.length > 1) {
                this.mapLineUiList = new Array();
                var lastPos: Vector2D = $arr[0];
                for (var i: number = 0; i < $arr.length; i++) {
                    while (Vector2D.distance(lastPos, $arr[i]) > 8) {
                        lastPos = this.nextPostForTow(lastPos, $arr[i])
                        var $ui: MapLineUi = new MapLineUi();
                        $ui.x = lastPos.x;
                        $ui.y = lastPos.y;
                        $ui.width = 1;
                        $ui.height = 1;
                        this.mapLineUiList.push($ui);
                    }
                }
                this.makeLineVetlineObjData();
            } else {
                this.objData.treNum = 0;
                console.log("路线清除")
            }
        }
        private nextPostForTow(a: Vector2D, b: Vector2D): Vector2D
        {
            var c: Vector2D = new Vector2D(b.x - a.x, b.y - a.y);
            c.normalize();
            c.x = c.x*4;
            c.y = c.y*4;

            c.x += a.x
            c.y += a.y
            return c
        }
   

        private mapLineUiList: Array<MapLineUi>;
        private makeLineVetlineObjData(): void {
        
            if (!this.objData) {
                this.objData = new ObjData;
            }
            this.objData.vertices = new Array();
            this.objData.indexs = new Array();
            this.getUiDataForItem();
            if (this.objData.vertexBuffer) {
                Scene_data.context3D.uploadBuff3DByBuffer(this.objData.vertexBuffer, this.objData.vertices);
                Scene_data.context3D.uploadIndexBuff3DByBuffer(this.objData.indexBuffer, this.objData.indexs);
            } else {
                this.objData.vertexBuffer = Scene_data.context3D.uploadBuff3D(this.objData.vertices);
                this.objData.indexBuffer = Scene_data.context3D.uploadIndexBuff3D(this.objData.indexs);
            }
            this.objData.treNum = this.objData.indexs.length;

        }
        private anglyNum:number=0
        private getUiDataForItem(): void
        {
         //   this.anglyNum++;
            var $v: Array<number> = new Array;
            for (var i: number = 0; i < this.mapLineUiList.length; i++) {
                var $ui: MapLineUi = this.mapLineUiList[i];

                $ui.parent = this.container;
                $ui.applyAbsolutePoint();
                $ui.renderX = $ui.absoluteX / Scene_data.stageWidth * 2 - 1;
                $ui.renderY = - $ui.absoluteY / Scene_data.stageHeight * 2 + 1;

                var $m: Matrix3D = new Matrix3D;
                $m.appendRotation(this.anglyNum, Vector3D.Z_AXIS);


                var $whScale: number = (Scene_data.stageWidth / Scene_data.stageHeight);

                var knumW: number = $ui.absoluteWidth / Scene_data.stageWidth * 2;
                var knumH: number = ($ui.absoluteHeight / Scene_data.stageHeight * 2) / $whScale;
                var A: Vector3D = new Vector3D(-1 * knumW, -1 * knumH, 0);
                var B: Vector3D = new Vector3D(+1 * knumW, -1 * knumH, 0);

                var C: Vector3D = new Vector3D(-1 * knumW, +1 * knumH, 0);
                var D: Vector3D = new Vector3D(+1 * knumW, +1 * knumH, 0);
      
                A = $m.transformVector(A);
                B = $m.transformVector(B);
                C = $m.transformVector(C);
                D = $m.transformVector(D);


                var a: Vector2D = new Vector2D($ui.renderX + A.x, $ui.renderY + A.y * $whScale);
                var b: Vector2D = new Vector2D($ui.renderX + B.x, $ui.renderY + B.y * $whScale);
                var c: Vector2D = new Vector2D($ui.renderX + C.x, $ui.renderY + C.y * $whScale);
                var d: Vector2D = new Vector2D($ui.renderX + D.x, $ui.renderY + D.y * $whScale);

                this.objData.vertices.push(a.x, a.y, 1, 1);
                this.objData.vertices.push(b.x, b.y, 1, 1);
                this.objData.vertices.push(c.x, c.y, 1, 1);
                this.objData.vertices.push(d.x, d.y, 1, 1);

                this.objData.indexs.push(0 + i * 4, 1 + i * 4, 3 + i * 4);
                this.objData.indexs.push(0 + i * 4, 3 + i * 4, 2 + i * 4);
            }
   

        }
        private addPosTo($v: Vector3D): void {

            this.objData.vertices.push($v.x);
            this.objData.vertices.push($v.y);
            this.objData.vertices.push($v.z);
            this.objData.vertices.push($v.w);

        }
        public update(): void {

            if (this.objData && this.objData.treNum>0) {
                Scene_data.context3D.setProgram(this.program);
                Scene_data.context3D.setVa(0, 4, this.objData.vertexBuffer);
                Scene_data.context3D.drawCall(this.objData.indexBuffer, this.objData.treNum);
            }

  
        }
    }
}

/*
module map {
    export class MapWalkLineShader extends Shader3D {
        static MapWalkLineShader: string = "MapWalkLineShader";
        constructor() {
            super();
        }
        binLocation($context: WebGLRenderingContext): void {
            $context.bindAttribLocation(this.program, 0, "v3Pos");

        }
        getVertexShaderString(): string {
            var $str: string =
                "attribute vec3 v3Pos;" +
                "void main(void)" +
                "{" +
                "   vec4 vt0= vec4(v3Pos, 1.0);" +
                "   gl_Position = vt0;" +
                "}"
            return $str
        }
        getFragmentShaderString(): string {
            var $str: string =
                "precision mediump float;\n" +
                "void main(void)\n" +
                "{\n" +
                      "gl_FragColor = vec4(1.0,0.0,0.0, 1.0);\n" +
                "}"
            return $str

        }

    }
    export class MapWalkLineComponent extends UIRenderComponent {
        public constructor() {
            super();
            ProgrmaManager.getInstance().registe(MapWalkLineShader.MapWalkLineShader, new MapWalkLineShader)
            this.shader = ProgrmaManager.getInstance().getProgram(MapWalkLineShader.MapWalkLineShader);
            this.program = this.shader.program;
            this.makeLineData()
        }

        private makeLineData(): void
        {
            this.objData = new ObjData;
            this.objData.vertices = new Array();
            this.objData.indexs=new Array()

            this.addPosTo(new Vector3D(0, 0, 0));
            this.addPosTo(new Vector3D(1, 0, 0));
            this.addPosTo(new Vector3D(0, 1, 0));
            this.addPosTo(new Vector3D(1, 1, 0));

            this.objData.indexs.push(0,1,2)

            this.objData.vertexBuffer = Scene_data.context3D.uploadBuff3D(this.objData.vertices);
            this.objData.indexBuffer = Scene_data.context3D.uploadIndexBuff3D(this.objData.indexs);

            this.objData.treNum = 3;

        }
        private addPosTo($v:Vector3D): void
        {
            this.objData.vertices.push($v.x)
            this.objData.vertices.push($v.y)
            this.objData.vertices.push($v.z)

        }
        public update(): void {
            Scene_data.context3D.setProgram(this.program);
            Scene_data.context3D.setVa(0, 3, this.objData.vertexBuffer);
            Scene_data.context3D.drawCall(this.objData.indexBuffer, this.objData.treNum);
            super.update()
        }
    }
}

*/