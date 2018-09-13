﻿module activity {
    //活动类型
    export class ActivityType {
        public static DAILY: number = 0;
        public static TIMELIMIT: number = 1;
    }

    export class ActivityModel {

        private static _instance: ActivityModel;
        public static getInstance(): ActivityModel {
            if (!this._instance) {
                this._instance = new ActivityModel();
            }
            return this._instance;
        }

        public constructor() {
            this.getBaseList();
        }

        private _activityary: Array<ActivityItemVo>;
        private getBaseList(): void {
            this._activityary = new Array<ActivityItemVo>();
            var tabary: Array<tb.TB_activity_base> = tb.TB_activity_base.get_TB_activity_base();
            for (var i = 0; i < tabary.length; i++) {
                var aa: ActivityItemVo = new ActivityItemVo();
                aa.data = tabary[i];
                this._activityary.push(aa);
            }
        }

        public compareAandB($ary: Array<ActivityItemVo>, $type: number): boolean {
            if ($ary) {
                var newAry: Array<ActivityItemVo> = this.getList($type);
                for (var i = 0; i < newAry.length; i++) {
                    if (newAry[i].data.id != $ary[i].data.id) {
                        console.log("------排序不对------");
                        return true;
                    }
                    if (newAry[i].state != $ary[i].state) {
                        console.log("------状态不对------",newAry[i].state);
                        return true;
                    }
                }
                return false;
            } else {
                console.log("------数据不存在------");
                return true;
            }
        }

        /**
         * getList
         */
        public getList($type: number): Array<ActivityItemVo> {
            var $finalary: Array<ActivityItemVo>;
            switch ($type) {
                case ActivityType.DAILY:
                    //日常活动
                    $finalary = this.divisionAry(this.getdailytask());
                    break;
                case ActivityType.TIMELIMIT:
                    //限时活动
                    $finalary = this.divisionAry(this.gettimelimittask());
                    break;
                default:
                    break;
            }
            return $finalary;
        }

        //日常活动列表
        private getdailytask(): Array<ActivityItemVo> {
            var $allList: Array<ActivityItemVo> = new Array;
            for (var i = 0; i < this._activityary.length; i++) {
                if (this._activityary[i].data.greptimelim == 0) {
                    $allList.push(this._activityary[i]);
                }
            }
            return $allList;
        }

        //限时活动列表
        private gettimelimittask(): Array<ActivityItemVo> {
            var $allList: Array<ActivityItemVo> = new Array;
            for (var i = 0; i < this._activityary.length; i++) {
                if (this._activityary[i].data.greptimelim == 1) {
                    $allList.push(this._activityary[i]);
                }
            }
            return $allList;
        }

        private SortListByTime($ary: Array<ActivityItemVo>): Array<ActivityItemVo> {
            $ary.sort(
                function (a: ActivityItemVo, b: ActivityItemVo): number {
                    if (a.getNearTime() < b.getNearTime()) {
                        return -1
                    } else {
                        return 1
                    }
                }
            )
            return $ary;
        }

        private SortListByOpenLev($ary: Array<ActivityItemVo>): Array<ActivityItemVo> {
            $ary.sort(
                function (a: ActivityItemVo, b: ActivityItemVo): number {
                    if (a.openLev < b.openLev) {
                        return -1
                    } else {
                        return 1
                    }
                }
            )
            return $ary;
        }

        private SortListByConditions($ary: Array<ActivityItemVo>): Array<ActivityItemVo> {
            $ary.sort(
                function (a: ActivityItemVo, b: ActivityItemVo): number {
                    if (b.getActivitySortNum() < a.getActivitySortNum()) {
                        return -1
                    } else {
                        return 1
                    }
                }
            )
            return $ary;
        }

        private divisionAry($ary: Array<ActivityItemVo>): Array<ActivityItemVo> {

            //区分当前可以参加的活动 和 已过时或者不足条件而限制的活动
            var arycanplay: Array<ActivityItemVo> = new Array;
            var arydontplay: Array<ActivityItemVo> = new Array;
            for (var i = 0; i < $ary.length; i++) {
                if ($ary[i].getActivate() && $ary[i].getActivityStart()) {
                    arycanplay.push($ary[i]);
                    // console.log("=====可完成任务====",);
                } else {
                    arydontplay.push($ary[i]);
                }
            }

            // console.log("=====可完成任务====",arydontplay);
            //区分可参加中的进行中和全天
            var aryproceed: Array<ActivityItemVo> = new Array;
            var aryallday: Array<ActivityItemVo> = new Array;
            for (var i = 0; i < arycanplay.length; i++) {
                if (arycanplay[i].isallday) {
                    aryallday.push(arycanplay[i]);
                } else {
                    aryproceed.push(arycanplay[i]);
                }
            }

            aryproceed = this.SortListByConditions(aryproceed);
            aryallday = this.SortListByConditions(aryallday);


            //区分不可参加中的未激活，未开始，还有已结束
            var arydontactivate: Array<ActivityItemVo> = new Array;
            var arydontstart: Array<ActivityItemVo> = new Array;
            var aryend: Array<ActivityItemVo> = new Array;
            for (var i = 0; i < arydontplay.length; i++) {
                if (arydontplay[i].state == -1) {
                    //未激活
                    arydontactivate.push(arydontplay[i]);
                } else if (arydontplay[i].state == 0) {
                    //未开始
                    arydontstart.push(arydontplay[i]);
                } else {
                    aryend.push(arydontplay[i]);
                }
            }

            arydontstart = this.SortListByTime(arydontstart);
            arydontactivate = this.SortListByOpenLev(arydontactivate);

            //区分已结束中的已完成和未完成
            var arycomplete: Array<ActivityItemVo> = new Array;
            var arydontcomplete: Array<ActivityItemVo> = new Array;
            for (var i = 0; i < aryend.length; i++) {
                if (aryend[i].state == 2 || (aryend[i].state == 1 && aryend[i].canreceive)) {
                    arycomplete.push(aryend[i]);
                } else {
                    arydontcomplete.push(aryend[i]);
                }
            }

            arycomplete = this.SortListByConditions(arycomplete);
            arydontcomplete = this.SortListByConditions(arydontcomplete);

            return aryproceed.concat(aryallday, arydontstart, arydontactivate, arycomplete, arydontcomplete);
        }
    }




    export class ActivityItemVo {
        public data: tb.TB_activity_base;
        public state: number     //活动的状态  -1:未激活  0：未开始  1：正在进行  2：已完成 3：已结束 4.今日未开
        public openLev: number     //开启等级
        public isallday: boolean = false     //是否为全天活动
        public canreceive: boolean = false     //是否可领取奖励
        public daliyinfo: string = ""     //活动日期info

        //剩余次数
        public getNum(): number {
            return this.data.nums - GuidData.instanceData.getActivityNumByID(this.data.id);
        }
        public getActivateIsComplete(): boolean {
            var completenum = GuidData.instanceData.getActivityNumByID(this.data.id)
            var total: number = this.data.nums;
            var $viplev: number = GuidData.player.getVipLevel();
            var vipnum: number;
            if (GuidData.player.getIsVIP()) {
                vipnum = this.data.vipnums[$viplev - 1]
            } else {
                vipnum = 0
            }
            if (total <= completenum) {
                this.canreceive = true;
                if (completenum >= total + vipnum) {
                    //完成了vip次数和总次数，则状态置完成
                    return true;
                }
            }else{
                this.canreceive = false;
            }
            return false;
        }

        private hasWeek($weekid: number): boolean {
            //如果不存在或者长度为0，则代表此活动为整星期开放
            if (!this.data.day || this.data.day.length == 0) {
                this.daliyinfo = ""
                return true;
            }
            var tf: boolean = false;
            this.daliyinfo = ColorType.Brown7a2f21 + "每周"
            for (let i = 0; i < this.data.day.length; i++) {
                this.daliyinfo += getDateName(this.data.day[i])
                if (i < this.data.day.length - 1) {
                    this.daliyinfo += ","
                }
                if ($weekid == this.data.day[i]) {
                    tf = true
                }
            }
            return tf;
        }

        /**
         * 1.等级不满足直接返回
         * 2.开服时间是否超过
         * 3.是否达到每周进行活动的日子
         */
        public getActivate(): boolean {
            this.openLev = this.data.limdata;
            var $time = this.data.time;
            if ($time && $time.length > 0) {
            } else {
                //全天活动
                this.isallday = true;
            }

            //等级是否满足开启条件
            var levflag: boolean
            if (this.data.limtype == 1) {
                levflag = this.openLev <= GuidData.player.getLevel();
            } else {
                levflag = true;
            }

            //等级未达到 ——未解锁
            if (!levflag) {
                this.state = -1;
                return false;
            }


            //活动是否开启
            var canplay: boolean = false;

            //先判断是开服几日后的活动吗，如果是就按开服活动来显示，如果不是，就按每周活动来显示
            if (this.data.server_open_day > 0) {
                //开服当天0点时刻
                var serveropentimeDate: Date = new Date(GameInstance.serverOpenTime);
                serveropentimeDate.setHours(0);
                serveropentimeDate.setMinutes(0);
                serveropentimeDate.setSeconds(0);
                //开服活动当天的时间戳
                var startTime: number = serveropentimeDate.getTime() + (this.data.server_open_day * 24 * 60 * 60)
                //开服活动结束时间
                var endTime: number = serveropentimeDate.getTime() + ((this.data.server_open_day + 1) * 24 * 60 * 60)

                // startTime = GameInstance.getServerNow() - 86400
                // endTime = GameInstance.getServerNow()
                if (startTime > GameInstance.getServerNow()) {
                    //活动还没来临
                    var lastday: number = Math.ceil((startTime - GameInstance.getServerNow()) / 86400)
                    this.daliyinfo = ColorType.Brown7a2f21 + lastday + "天后开启";
                } else if (startTime <= GameInstance.getServerNow() && endTime > GameInstance.getServerNow()) {
                    //活动今日进行
                    canplay = true;
                } else {
                    canplay = this.startActByDay();
                }
            } else {
                canplay = this.startActByDay();
            }

            //日期未到 ——未开启
            if (!canplay) {
                this.state = 4;
            } else {
                this.state = 0;
            }

            return canplay;
        }


        //每周某天活动是否开启
        private startActByDay(): boolean {
            var $ts: number = GameInstance.getServerNow();
            var $sever: Date = new Date($ts * 1000);
            // console.log("----今日周" + $sever.getDay());
            return this.hasWeek($sever.getDay());
        }

        /**
         * 活动是否处于可参加状态
         */
        public getActivityStart(): boolean {

            var timelimit: boolean = false;
            var completelimit: boolean = false;
            //1.活动时间
            var $time = this.data.time;
            if ($time && $time.length > 0) {
                //有时限活动
                for (var i = 0; i < $time.length; i++) {
                    if (this.compareTime($time[i][0], $time[i][1])) {
                        //活动未开始
                        this.state = 0
                        break;
                    } else {
                        if (this.compareTime($time[i][2], $time[i][3])) {
                            //正在进行的活动
                            timelimit = true;
                            break;
                        }
                    }
                    //活动已结束
                    this.state = 3
                }
            } else {
                //全天活动
                this.isallday = true;
                timelimit = true;
            }

            //2.活动完成情况
            if (!this.getActivateIsComplete()) {
                completelimit = true;
            } else {
                //活动已完成
                this.state = 2;
            }

            if (timelimit && completelimit) {
                this.state = 1;
            }
            return (timelimit && completelimit);
        }


        public getNearTime(): number {
            //设置状态
            if (this.getActivate()) {
                this.getActivityStart();
            }
            //找一个最近的时间
            var $time = this.data.time;
            if ($time && $time.length > 0) {
                //有时限活动
                for (var i = 0; i < $time.length; i++) {
                    //比较结束时间
                    if (this.compareTime($time[i][2], $time[i][3])) {
                        //记录结束时间
                        return $time[i][2] * 60 + $time[i][3];
                    }
                }
                //如果已结束，则时间最早的日期+1    结束了的，记录开始时间
                return ($time[0][0] + 24) * 60 + $time[0][1];
            } else {
                //全天活动
                this.isallday = true;
                //服务器当前标准时间
                var $ts: number = GameInstance.getServerNow();
                var $sever: Date = new Date($ts * 1000);
                return $sever.getHours() * 60 + $sever.getMinutes();
            }
        }


        public getNearStartTime(): string {
            var $time = this.data.time;
            if ($time && $time.length > 0) {
                //有时限活动
                for (var i = 0; i < $time.length; i++) {
                    //比较结束时间
                    if (this.compareTime($time[i][2], $time[i][3])) {
                        //记录结束时间
                        return this.time2timestr($time[i][0]) + ":" + this.time2timestr($time[i][1]);
                    }
                }
                //如果已结束，则时间最早的日期+1    结束了的，记录开始时间
                return this.time2timestr($time[0][0]) + ":" + this.time2timestr($time[0][1]);
            }

            return "";

        }

        private time2timestr($num: number): string {
            var aa: string;
            if ($num < 10) {
                aa = "0" + $num;
            } else {
                aa = $num + ""
            }
            return aa;
        }

        private compareTime($hour: number, $min: number): boolean {
            //服务器当前标准时间
            var $ts: number = GameInstance.getServerNow();
            var $sever: Date = new Date($ts * 1000);
            var $play: Date = new Date($ts * 1000);

            $play.setHours($hour);
            $play.setMinutes($min);
            $play.setSeconds(0);
            $play.setMilliseconds(0);

            //越过时间
            var $endt: number = $sever.getTime() - $play.getTime()
            if ($endt < 0) {
                //未到达指定时间
                return true;
            }
            return false;
        }

        //活动排序值 1.推荐与否 2.全天、时间早-晚 3.全天中（等级低-高）
        public getActivitySortNum(): number {
            var total: number = 0;
            if (this.data.recommend == 1) {
                //推荐活动
                total += 5000;
            }
            //开启等级
            total += (3100 - this.openLev)
            return total;
        }

    }

}