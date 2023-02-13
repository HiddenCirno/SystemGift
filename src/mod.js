"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const MessageType_1 = require("C:/snapshot/project/obj/models/enums/MessageType");
const baseJson2 = __importStar(require("../db/trader/SimulationSystemTrader/base.json"));
class Mod {
    preAkiLoad(container) {
        const configServer = container.resolve("ConfigServer");
        const traderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const preAkiModLoader = container.resolve("PreAkiModLoader");
        const staticRouterModService = container.resolve("StaticRouterModService");
        this.setupTraderUpdateTime(traderConfig);
        const imageRouter = container.resolve("ImageRouter");
        this.registerProfileImage(preAkiModLoader, imageRouter);
        Mod.container = container;
        staticRouterModService.registerStaticRouter("StaticRouteAkiOnSaveLoad", [
            {
                url: "/launcher/profile/compatibleTarkovVersion",
                action: (url, info, sessionId, output) => {
                    this.SMessage(container, sessionId);
                    return output;
                }
            }
        ], "aki");
    }
    postAkiLoad(container) {
    }
    postDBLoad(container) {
        const Logger = container.resolve("WinstonLogger");
        const PreAkiModLoader = container.resolve("PreAkiModLoader");
        const FuncDatabaseServer = container.resolve("DatabaseServer");
        const FuncImporterUtil = container.resolve("ImporterUtil");
        const VFS = container.resolve("VFS");
        const JsonUtil = container.resolve("JsonUtil");
        const ClientDB = FuncDatabaseServer.getTables();
        const ModPath = PreAkiModLoader.getModPath("SystemGift");
        const DB = FuncImporterUtil.loadRecursive(`${ModPath}db/`);
        const Locale = ClientDB.locales.global["ch"];
        const ELocale = ClientDB.locales.global["en"];
        const Pack = JsonUtil.deserialize(VFS.readFile(`${ModPath}package.json`));
        const version = Pack.version;
        const ModName = Pack.name;
        const http = require('https');
        //添加系统消息
        for (let key in DB.templates.Locale) {
            Locale[key] = DB.templates.Locale[key];
            ELocale[key] = DB.templates.ELocale[key];
        }
        for (let trader in DB.trader) {
            ClientDB.traders[trader] = DB.trader[trader];
            var TraderBase = DB.trader[trader].base;
            var TraderID = TraderBase._id;
            Locale[TraderID + " FullName"] = TraderBase.surname;
            Locale[TraderID + " FirstName"] = TraderBase.name;
            Locale[TraderID + " Nickname"] = TraderBase.nickname;
            Locale[TraderID + " Location"] = TraderBase.location;
            Locale[TraderID + " Description"] = TraderBase.description;
            ELocale[TraderID + " FullName"] = TraderBase.surname;
            ELocale[TraderID + " FirstName"] = TraderBase.name;
            ELocale[TraderID + " Nickname"] = TraderBase.nickname;
            ELocale[TraderID + " Location"] = TraderBase.location;
            ELocale[TraderID + " Description"] = TraderBase.description;
        }
        const checkUpdate = (url) => {
            const timeout = 5000;
            const currentVersion = version;
            return new Promise((resolve, reject) => {
                const req = http.request(url, (res) => {
                    let data = '';
                    CustomLog("Checking update for mod " + ModName + "....");
                    CustomLog("模组" + ModName + "正在检查更新…");
                    //CustomLog(data)
                    res.on('data', (chunk) => {
                        //console.log(`BODY: ${chunk}`);
                        data += chunk;
                    });
                    res.on('end', () => {
                        const responseVersion = data.trim();
                        //CustomLog(data)
                        if (responseVersion !== currentVersion) {
                            CustomLog(`Current version: ${currentVersion}. New version: ${responseVersion}. Mod Name: ${ModName}`);
                            CustomLog(`当前版本：${currentVersion}. 最新版本：${responseVersion}. 模组名称：${ModName}`);
                            resolve({ currentVersion, responseVersion });
                        }
                        else {
                            CustomLog(`Current version (${currentVersion}) is up-to-date. Mod Name: ${ModName}`);
                            CustomLog(`当前版本（${currentVersion}）已是最新。模组名称：${ModName}`);
                            resolve(null);
                        }
                    });
                });
                req.on('error', (error) => {
                    CustomDenied(`Request failed: ${error.message}`);
                    reject(error);
                });
                req.setTimeout(timeout, () => {
                    CustomDenied(`Request timed out after ${timeout} milliseconds.`);
                    req.abort();
                    reject(`Request timed out after ${timeout} milliseconds.`);
                });
                req.end();
            });
        };
        checkUpdate('https://gitee.com/HiddenCirno/version-check/raw/master/SystemGiftVersionCheck.txt')
            .then((result) => {
            if (result) {
                CustomAccess(`There is a new version available! Mod Name: ${ModName}`);
                CustomLog(`发现可用的新版本！模组名称：${ModName}`);
                CustomDenied(`Warning: You are using a outdated version! Mod Name: ${ModName}`);
                CustomDenied(`警告：你正在使用已经过期的版本！模组名称：${ModName}`);
            }
            else {
                CustomLog(`You are using the latest version. Mod Name: ${ModName}`);
                CustomLog(`你正在使用最新版本。模组名称：${ModName}`);
            }
            CustomLog("View the code on github: https://github.com/HiddenCirno/SystemGift");
            CustomLog("在GitHub上查看此项目：https://github.com/HiddenCirno/SystemGift");
        })
            .catch((error) => {
            CustomDenied(error);
        });
        function CustomLog(string) {
            Logger.logWithColor("[Console]: " + string, "yellow");
        }
        function CustomAccess(string) {
            Logger.logWithColor("[Console]: " + string, "green");
        }
        function CustomDenied(string) {
            Logger.logWithColor("[Console]: " + string, "red");
        }
    }
    setupTraderUpdateTime(traderConfig) {
        const traderRefreshRecord2 = { traderId: baseJson2._id, seconds: 3600 };
        traderConfig.updateTime.push(traderRefreshRecord2);
    }
    SMessage(container, sessionId) {
        const diaoluehelper = container.resolve("DialogueHelper");
        const hashUtil = container.resolve("HashUtil");
        const PreAkiModLoader = container.resolve("PreAkiModLoader");
        const Logger = container.resolve("WinstonLogger");
        const FuncDatabaseServer = container.resolve("DatabaseServer");
        const FuncImporterUtil = container.resolve("ImporterUtil");
        const profileHelper = container.resolve("ProfileHelper");
        const VFS = container.resolve("VFS");
        const JsonUtil = container.resolve("JsonUtil");
        const ClientDB = FuncDatabaseServer.getTables();
        const Handbook = ClientDB.templates.handbook;
        const ModPath = PreAkiModLoader.getModPath("SystemGift");
        const Locale = ClientDB.locales.global["ch"];
        const ELocale = ClientDB.locales.global["en"];
        const DB = FuncImporterUtil.loadRecursive(`${ModPath}db/`);
        const Timer = JsonUtil.deserialize(VFS.readFile(`${ModPath}timer.json`));
        //使用跳蚤市场标签创建附件数组
        function CreateArrWithTag(Tag) {
            var Array = [];
            for (var i = 0; i < ClientDB.templates.handbook.Items.length; i++) {
                var ItemData = ClientDB.templates.handbook.Items[i];
                if (ItemData.ParentId == Tag) {
                    Array.push({
                        "_id": hashUtil.generate(),
                        "_tpl": ItemData.Id,
                        "upd": {
                            "StackObjectsCount": 1,
                            "SpawnedInSession": true
                        }
                    });
                }
            }
            return Array;
        }
        //从跳蚤市场标签创建ID数组
        function createWithTag(Tag) {
            var Array = [];
            for (var i = 0; i < ClientDB.templates.handbook.Items.length; i++) {
                var ItemData = ClientDB.templates.handbook.Items[i];
                if (ItemData.ParentId == Tag) {
                    Array.push(ItemData.Id);
                }
            }
            return Array;
        }
        //数组处理
        function addInArray(Arr1, Arr2) {
            for (var i = 0; i < Arr2.length; i++) {
                Arr1.push(Arr2[i]);
            }
        }
        function addRewardWithCount(id, stack, count, array) {
            for (var i = 0; i < count; i++) {
                array.push({
                    "_id": hashUtil.generate(),
                    "_tpl": id,
                    "upd": {
                        "StackObjectsCount": stack,
                        "SpawnedInSession": true
                    }
                });
            }
        }
        //使用跳蚤市场标签创建满堆叠弹药附件数组
        function CreateAmmoWithTag(Tag) {
            var Array = [];
            for (var i = 0; i < ClientDB.templates.handbook.Items.length; i++) {
                var ItemData = ClientDB.templates.handbook.Items[i];
                if (ItemData.ParentId == Tag && ClientDB.templates.items[ItemData.Id]._props.StackMaxSize > 1) {
                    Array.push({
                        "_id": hashUtil.generate(),
                        "_tpl": ItemData.Id,
                        "upd": {
                            "StackObjectsCount": ClientDB.templates.items[ItemData.Id]._props.StackMaxSize,
                            "SpawnedInSession": true
                        }
                    });
                }
            }
            return Array;
        }
        //添加战利品
        function AddReward(id, count, Array) {
            Array.push({
                "_id": hashUtil.generate(),
                "_tpl": id,
                "upd": {
                    "StackObjectsCount": count,
                    "SpawnedInSession": true
                }
            });
        }
        //节日日期计算
        function findThanksgivingMonth(year) {
            let thanksgiving = new Date(year, 10, 1); // 10 is the index for November
            thanksgiving.setDate(thanksgiving.getDate() + (21 - thanksgiving.getDay() % 7) % 7);
            let month = (thanksgiving.getMonth() + 1);
            return month;
        }
        function findThanksgivingDay(year) {
            var thanksgiving = new Date(year, 10, 1); // 10 is the index for November
            var thanksgivingDay = thanksgiving.getDay();
            var diff = 5 - thanksgivingDay + 21; // Number of days to the second Sunday
            var thanksgivingday = new Date(thanksgiving.getTime() + diff * 24 * 60 * 60 * 1000);
            var day = thanksgivingday.getDate();
            return day;
        }
        function motherDayMonth(year) {
            // Calculate the date of the second Sunday in May
            var firstMay = new Date(year, 4, 1); // 1st May
            var firstMayDay = firstMay.getDay();
            var diff = 7 - firstMayDay + 7; // Number of days to the second Sunday
            var motherDay = new Date(firstMay.getTime() + diff * 24 * 60 * 60 * 1000);
            // Format the date as 'dd-mm-yyyy'
            var month = (motherDay.getMonth() + 1);
            return month;
        }
        function motherDayDay(year) {
            // Calculate the date of the second Sunday in May
            var firstMay = new Date(year, 4, 1); // 1st May
            var firstMayDay = firstMay.getDay();
            var diff = 7 - firstMayDay + 7; // Number of days to the second Sunday
            var motherDay = new Date(firstMay.getTime() + diff * 24 * 60 * 60 * 1000);
            // Format the date as 'dd-mm-yyyy'
            var day = motherDay.getDate();
            return day;
        }
        //自定义函数
        //读取数据
        function getBackpackSize(id) {
            var size = 0;
            for (var j = 0; j < ClientDB.templates.items[id]._props.Grids.length; j++) {
                size = size + (ClientDB.templates.items[id]._props.Grids[j]._props.cellsH * ClientDB.templates.items[id]._props.Grids[j]._props.cellsV);
            }
            return size;
        }
        function getArmorLevel(id) {
            return ClientDB.templates.items[id]._props.armorClass;
        }
        function getAmmoData(id) {
            return ClientDB.templates.items[id]._props.PenetrationPower;
        }
        //废弃内容
        function countInArray(array, item) {
            return array.reduce((count, current) => count + (current === item), 0);
        }
        function condition(num) {
            return 1 / num;
        }
        function randomPick(array, type) {
            var total = 0;
            var weights = [];
            for (var i = 0; i < array.length; i++) {
                var weight = 0;
                switch (type) {
                    case "ammo":
                        {
                            weight = condition(Math.floor((ClientDB.templates.items[array[i]._tpl]._props.PenetrationPower) / 10));
                            total += weight;
                            weights.push(total);
                        }
                        break;
                    case "armor":
                        {
                            weight = condition(ClientDB.templates.items[array[i]._tpl]._props.armorClass);
                            total += weight;
                            weights.push(total);
                        }
                        break;
                    case "backpack": {
                        weight = condition((getBackpackSize(array[i]._tpl)) / 10);
                        total += weight;
                        weights.push(total);
                    }
                }
            }
            var randomValue = Math.random() * total;
            for (var i = 0; i < weights.length; i++) {
                if (randomValue < weights[i]) {
                    return array[i];
                }
            }
        }
        //自定义log
        function Tip(str) {
            Logger.logWithColor("System: " + str, "green");
        }
        function Warn(str) {
            Logger.logWithColor("System: " + str, "red");
        }
        //添加战利品
        function addWithCount(arr, obj, int) {
            for (var i = 0; i < int; i++) {
                var randomint = Math.floor(Math.random() * obj.length);
                arr.push(obj[randomint]);
            }
        }
        //从数组中抽取随机元素
        function DrawObjFromArr(Array) {
            var randomint = Math.floor(Math.random() * Array.length);
            return Array[randomint];
        }
        //使用二维数组合并数组
        function createArrs(Array) {
            var allarr = [];
            for (var i = 0; i < Array.length; i++) {
                for (var j = 0; j < Array[i].length; j++) {
                    allarr.push(Array[i][j]);
                }
            }
            return allarr;
        }
        //从id生成武器
        function generateWeapon(inputWeapon, count, custom) {
            const weapon = ClientDB.templates.items[inputWeapon];
            let preset = [];
            preset.push({
                "_id": weapon._id + "parent" + custom,
                "_tpl": weapon._id
            });
            function generateAttachment(slots, parentId) {
                slots.forEach(slot => {
                    const availableAttachments = slot._props.filters[0].Filter;
                    const randomAttachment = availableAttachments[Math.floor(Math.random() * availableAttachments.length)];
                    const attachment = ClientDB.templates.items[randomAttachment];
                    if (availableAttachments.length > 0) {
                        if (slot._required == true) {
                            try {
                                preset.push({
                                    "_id": attachment._id + slot._name + custom,
                                    "_tpl": attachment._id,
                                    "parentId": parentId,
                                    "slotId": slot._name
                                });
                                if (attachment._props.Slots) {
                                    generateAttachment(attachment._props.Slots, attachment._id + slot._name + custom);
                                }
                            }
                            catch (err) {
                                Warn("Undefined Item: " + attachment._id);
                                Warn(err);
                            }
                        }
                        else if (Math.floor(Math.random() * 100) < count) {
                            try {
                                preset.push({
                                    "_id": attachment._id + slot._name + custom,
                                    "_tpl": attachment._id,
                                    "parentId": parentId,
                                    "slotId": slot._name
                                });
                                if (attachment._props.Slots) {
                                    generateAttachment(attachment._props.Slots, attachment._id + slot._name + custom);
                                }
                            }
                            catch (err) {
                                Warn("Undefined Item: " + attachment._id);
                                Warn(err);
                            }
                        }
                    }
                });
            }
            if (weapon._props.Slots) {
                generateAttachment(weapon._props.Slots, weapon._id + "parent" + custom);
            }
            return {
                Preset: preset
            };
        }
        //将生成结果输入附件数组
        function convertWponArr(result, arr) {
            for (var i = 0; i < result.Preset.length; i++) {
                arr.push({
                    "_id": result.Preset[i]._id,
                    "_tpl": result.Preset[i]._tpl,
                    "parentId": result.Preset[i].parentId,
                    "slotId": result.Preset[i].slotId,
                    "upd": {
                        "SpawnedInSession": true
                    }
                });
            }
        }
        var 每日奖励 = []; //每日奖励池
        var 每周奖励 = []; //每周奖励池
        var 每月奖励 = []; //每月奖励池
        var 情人节 = [];
        var 圣诞节 = [];
        var 万圣节 = [];
        var 新年 = [];
        var 感恩节 = [];
        var 母亲节 = [];
        var DebugAttachment = [];
        var 护甲 = [];
        var 五六级甲 = [];
        var 四级甲 = [];
        var 防弹胸挂 = [];
        var 普通胸挂 = [];
        var 小背包 = [];
        var 大背包 = [];
        var 四穿 = [];
        var 高穿 = [];
        var 医疗包 = CreateArrWithTag("5b47574386f77428ca22b338"); //急救包
        var 注射器 = CreateArrWithTag("5b47574386f77428ca22b33a"); //注射器
        var ArmorArr = CreateArrWithTag("5b5f701386f774093f2ecf0f"); //护甲
        var TacticalVestArr = CreateArrWithTag("5b5f6f8786f77447ed563642"); //弹挂
        var 食品 = CreateArrWithTag("5b47574386f77428ca22b336"); //食品
        var 饮料 = CreateArrWithTag("5b47574386f77428ca22b335"); //饮品
        var 背包 = CreateArrWithTag("5b5f6f6c86f774093f2ecf0b"); //背包
        var 贵重物品 = CreateArrWithTag("5b47574386f77428ca22b2f1"); //贵重物品
        var 容器 = CreateArrWithTag("5b5f6fa186f77409407a7eb7"); //容器
        var 子弹大类 = CreateAmmoWithTag("5b47574386f77428ca22b33b"); //子弹大类
        var 突击卡宾枪 = createWithTag("5b5f78e986f77447ed5636b1");
        var 突击步枪 = createWithTag("5b5f78fc86f77409407a7f90");
        var DMR = createWithTag("5b5f791486f774093f2ed3be");
        var 手枪 = createWithTag("5b5f792486f77447ed5636b3");
        var 霰弹枪 = createWithTag("5b5f794b86f77409407a7f92");
        var SMG = createWithTag("5b5f796a86f774093f2ed3c0");
        var 栓动式步枪 = createWithTag("5b5f798886f77447ed5636b5");
        var 机枪 = createWithTag("5b5f79a486f77409407a7f94");
        var 榴弹发射器 = createWithTag("5b5f79d186f774093f2ed3c2");
        var 其他 = CreateArrWithTag("5b47574386f77428ca22b2f4"); //其他
        var 医疗物资 = CreateArrWithTag("5b47574386f77428ca22b2f3"); //医疗物资
        var 家居用品 = CreateArrWithTag("5b47574386f77428ca22b2f0"); //家居用品
        var 工具 = CreateArrWithTag("5b47574386f77428ca22b2f6"); //工具
        var 建筑材料 = CreateArrWithTag("5b47574386f77428ca22b2ee"); //建筑材料
        var 易燃物品 = CreateArrWithTag("5b47574386f77428ca22b2f2"); //易燃物品
        var 电子产品 = CreateArrWithTag("5b47574386f77428ca22b2ef"); //电子产品
        var 能源物品 = CreateArrWithTag("5b47574386f77428ca22b2ed"); //能源物品
        var 情报物品 = CreateArrWithTag("5b47574386f77428ca22b341"); //情报物品
        var 贵重物品 = CreateArrWithTag("5b47574386f77428ca22b2f1"); //贵重物品
        var 投掷物 = CreateArrWithTag("5b5f7a2386f774093f2ed3c4"); //投掷物
        var 总枪械池 = createArrs([突击卡宾枪, 突击步枪, DMR, 手枪, 霰弹枪, SMG, 栓动式步枪, 机枪, 榴弹发射器]);
        var 每日枪械池 = createArrs([突击卡宾枪, 突击步枪, 手枪, 霰弹枪, SMG]);
        var 每周枪械池 = createArrs([突击卡宾枪, 突击步枪, 霰弹枪, SMG, 栓动式步枪, 机枪]);
        var 每月枪械池 = createArrs([突击步枪, 栓动式步枪, DMR, 机枪, 榴弹发射器]);
        var 交换用品 = createArrs([其他, 医疗物资, 家居用品, 工具, 建筑材料, 易燃物品, 电子产品, 能源物品, 情报物品, 贵重物品]);
        convertWponArr(generateWeapon(DrawObjFromArr(突击卡宾枪), 60, "DebugAttachment1"), DebugAttachment);
        //构建带有条件的数组(比如高级护甲, 大容量背包)
        //防弹胸挂
        for (var i = 0; i < TacticalVestArr.length; i++) {
            if (getArmorLevel(TacticalVestArr[i]._tpl) > 0) {
                防弹胸挂.push(TacticalVestArr[i]);
            }
        }
        //普通胸挂
        for (var i = 0; i < TacticalVestArr.length; i++) {
            if (getArmorLevel(TacticalVestArr[i]._tpl) == 0) {
                普通胸挂.push(TacticalVestArr[i]);
            }
        }
        //五六级甲
        for (var i = 0; i < ArmorArr.length; i++) {
            if (getArmorLevel(ArmorArr[i]._tpl) > 4) {
                五六级甲.push(ArmorArr[i]);
            }
        }
        for (var i = 0; i < 防弹胸挂.length; i++) {
            if (getArmorLevel(防弹胸挂[i]._tpl) > 4) {
                五六级甲.push(防弹胸挂[i]);
            }
        }
        //最多四级甲
        for (var i = 0; i < ArmorArr.length; i++) {
            if (getArmorLevel(ArmorArr[i]._tpl) < 5) {
                四级甲.push(ArmorArr[i]);
            }
        }
        for (var i = 0; i < 防弹胸挂.length; i++) {
            if (getArmorLevel(防弹胸挂[i]._tpl) < 5) {
                四级甲.push(防弹胸挂[i]);
            }
        }
        //全护甲初始化
        for (var i = 0; i < ArmorArr.length; i++) {
            if (getArmorLevel(ArmorArr[i]._tpl) > 0) {
                护甲.push(ArmorArr[i]);
            }
        }
        for (var i = 0; i < TacticalVestArr.length; i++) {
            if (getArmorLevel(TacticalVestArr[i]._tpl) > 0) {
                护甲.push(TacticalVestArr[i]);
            }
        }
        //背包
        for (var i = 0; i < 背包.length; i++) {
            if (getBackpackSize(背包[i]._tpl) < 30) {
                小背包.push(背包[i]);
            }
            if (getBackpackSize(背包[i]._tpl) >= 30) {
                大背包.push(背包[i]);
            }
        }
        //子弹
        for (var i = 0; i < 子弹大类.length; i++) {
            if (getAmmoData(子弹大类[i]._tpl) < 50 && getAmmoData(子弹大类[i]._tpl) >= 20) {
                四穿.push(子弹大类[i]);
            }
            if (getAmmoData(子弹大类[i]._tpl) >= 50) {
                高穿.push(子弹大类[i]);
            }
        }
        //初始化每日奖励
        addWithCount(每日奖励, 医疗包, 1);
        addWithCount(每日奖励, 注射器, 2);
        addWithCount(每日奖励, 四级甲, 1);
        addWithCount(每日奖励, 普通胸挂, 1);
        addWithCount(每日奖励, 贵重物品, 1);
        addWithCount(每日奖励, 小背包, 1);
        addWithCount(每日奖励, 食品, 4);
        addWithCount(每日奖励, 饮料, 3);
        addWithCount(每日奖励, 四穿, 2);
        AddReward("5449016a4bdc2d6f028b456f", 100000, 每日奖励); //卢布
        convertWponArr(generateWeapon(DrawObjFromArr(每日枪械池), 45, "每日奖励1"), 每日奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每日枪械池), 45, "每日奖励2"), 每日奖励);
        //初始化每周奖励
        addWithCount(每周奖励, 医疗包, 3);
        addWithCount(每周奖励, 注射器, 4);
        addWithCount(每周奖励, 食品, 8);
        addWithCount(每周奖励, 饮料, 5);
        addWithCount(每周奖励, 情报物品, 2);
        addWithCount(每周奖励, 贵重物品, 2);
        addWithCount(每周奖励, 交换用品, 3);
        addWithCount(每周奖励, 五六级甲, 2);
        addWithCount(每周奖励, 普通胸挂, 3);
        addWithCount(每周奖励, 大背包, 2);
        addWithCount(每周奖励, 四穿, 4);
        addWithCount(每周奖励, 高穿, 2);
        addWithCount(每周奖励, 容器, 1);
        convertWponArr(generateWeapon(DrawObjFromArr(每周枪械池), 65, "每周奖励1"), 每周奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每周枪械池), 65, "每周奖励2"), 每周奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每周枪械池), 65, "每周奖励3"), 每周奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每周枪械池), 65, "每周奖励4"), 每周奖励);
        //月
        addWithCount(每月奖励, 医疗包, 6);
        addWithCount(每月奖励, 注射器, 10);
        addWithCount(每月奖励, 食品, 15);
        addWithCount(每月奖励, 饮料, 12);
        addWithCount(每月奖励, 情报物品, 6);
        addWithCount(每月奖励, 贵重物品, 6);
        addWithCount(每月奖励, 交换用品, 8);
        addWithCount(每月奖励, 五六级甲, 5);
        addWithCount(每月奖励, 普通胸挂, 3);
        addWithCount(每月奖励, 大背包, 6);
        addWithCount(每月奖励, 四穿, 12);
        addWithCount(每月奖励, 高穿, 8);
        addWithCount(每月奖励, 容器, 3);
        AddReward("5c0126f40db834002a125382", 1, 每月奖励); //冰镐
        addRewardWithCount("5449016a4bdc2d6f028b456f", 500000, 10, 每月奖励); //卢布
        convertWponArr(generateWeapon(DrawObjFromArr(每月枪械池), 85, "每月奖励1"), 每月奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每月枪械池), 85, "每月奖励2"), 每月奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每月枪械池), 85, "每月奖励3"), 每月奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每月枪械池), 85, "每月奖励4"), 每月奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每月枪械池), 85, "每月奖励5"), 每月奖励);
        convertWponArr(generateWeapon(DrawObjFromArr(每月枪械池), 85, "每月奖励6"), 每月奖励);
        //情人节
        addRewardWithCount("57505f6224597709a92585a9", 1, 10, 情人节); //爱莲巧
        addRewardWithCount("59e3577886f774176a362503", 1, 10, 情人节); //糖
        addRewardWithCount("5d403f9186f7743cac3f229b", 1, 10, 情人节); //威士忌
        //圣诞节
        addWithCount(圣诞节, 饮料, 7);
        addWithCount(圣诞节, 食品, 10);
        addWithCount(圣诞节, 情报物品, 3);
        addRewardWithCount("5df8a6a186f77412640e2e80", 1, 10, 圣诞节); //红球
        addRewardWithCount("5df8a72c86f77412640e2e83", 1, 10, 圣诞节); //银球
        addRewardWithCount("5df8a77486f77412672a1e3f", 1, 10, 圣诞节); //紫球
        //感恩节
        addWithCount(感恩节, 食品, 21);
        addWithCount(感恩节, 饮料, 13);
        //母亲节
        addWithCount(母亲节, 食品, 15);
        addWithCount(母亲节, 饮料, 10);
        //公历新年
        addWithCount(新年, 投掷物, 19);
        addWithCount(新年, 食品, 21);
        addWithCount(新年, 饮料, 13);
        addRewardWithCount("5449016a4bdc2d6f028b456f", 500000, 20, 新年); //卢布
        //万圣节
        addWithCount(万圣节, 食品, 13);
        addWithCount(万圣节, 饮料, 8);
        addRewardWithCount("634959225289190e5e773b3b", 1, 10, 万圣节); //南瓜
        //从数组中抽取随机元素
        var DailyMessageArr = [
            "SystemMessageDaily1",
            "SystemMessageDaily2",
            "SystemMessageDaily3",
            "SystemMessageDaily4",
            "SystemMessageDaily5",
            "SystemMessageDaily6",
            "SystemMessageDaily7",
            "SystemMessageDaily8",
            "SystemMessageDaily9",
            "SystemMessageDaily10",
            "SystemMessageDaily11",
            "SystemMessageDaily12",
            "SystemMessageDaily13",
            "SystemMessageDaily14"
        ];
        var WeeklyMessageArr = [
            "SystemMessageWeekly1",
            "SystemMessageWeekly2",
            "SystemMessageWeekly3",
            "SystemMessageWeekly4",
            "SystemMessageWeekly5",
            "SystemMessageWeekly6"
        ];
        var MonthlyMessageArr = [
            "SystemMessageMonthly1",
            "SystemMessageMonthly2",
            "SystemMessageMonthly3",
            "SystemMessageMonthly4",
            "SystemMessageMonthly5"
        ];
        var DailyMessageID = DrawObjFromArr(DailyMessageArr);
        var WeeklyMessageID = DrawObjFromArr(WeeklyMessageArr);
        var MonthlyMessageID = DrawObjFromArr(MonthlyMessageArr);
        var DailyContent = diaoluehelper.createMessageContext(DailyMessageID, MessageType_1.MessageType.SYSTEM_MESSAGE, 24);
        var WeeklyContent = diaoluehelper.createMessageContext(WeeklyMessageID, MessageType_1.MessageType.SYSTEM_MESSAGE, 24);
        var MonthlyContent = diaoluehelper.createMessageContext(MonthlyMessageID, MessageType_1.MessageType.SYSTEM_MESSAGE, 24);
        var DebugContent = diaoluehelper.createMessageContext("SystemMessageDebug", MessageType_1.MessageType.SYSTEM_MESSAGE, 24);
        var now = new Date;
        var SpecialDaysStr = "";
        const specialDays = [{ month: 2, day: 14, Date: "情人节" }, { month: 1, day: 1, Date: "公历新年" }, { month: 11, day: 1, Date: "万圣节" }, { month: 12, day: 25, Date: "圣诞节" }, { month: findThanksgivingMonth(now.getFullYear()), day: findThanksgivingDay(now.getFullYear()), Date: "感恩节" }, { month: motherDayMonth(now.getFullYear()), day: motherDayDay(now.getFullYear()), Date: "母亲节" }];
        for (const specialDay of specialDays) {
            if ((now.getMonth() + 1) === specialDay.month && now.getDate() === specialDay.day) {
                //sent special day mail
                switch (specialDay.Date) {
                    case "情人节":
                        {
                            SpecialDaysStr = "情人节";
                        }
                        break;
                    case "圣诞节":
                        {
                            SpecialDaysStr = "圣诞节";
                        }
                        break;
                    case "感恩节":
                        {
                            SpecialDaysStr = "感恩节";
                        }
                        break;
                    case "母亲节":
                        {
                            SpecialDaysStr = "母亲节";
                        }
                        break;
                    case "公历新年":
                        {
                            SpecialDaysStr = "公历新年";
                        }
                        break;
                    case "万圣节":
                        {
                            SpecialDaysStr = "万圣节";
                        }
                        break;
                }
            }
        }
        Logger.info("SpecialDays: " + SpecialDaysStr);
        //if no data
        //create data for save
        if (Timer[sessionId] == undefined) {
            Timer[sessionId] = {};
            Timer[sessionId].Name = profileHelper.getFullProfile(sessionId).info.username;
            Timer[sessionId].Time = Date.now();
            Timer[sessionId].Year = now.getFullYear();
            Timer[sessionId].Month = now.getMonth() + 1;
            Timer[sessionId].Day = now.getDate();
            Timer[sessionId].count = 1;
            if (now.getDay() == 0) {
                Timer[sessionId].Week = 7;
            }
            else {
                Timer[sessionId].Week = now.getDay();
            }
            Timer[sessionId].firstlogin = false;
            //write file
            VFS.writeFile(`${ModPath}timer.json`, JSON.stringify(Timer, null, 4));
            //sent mails
            //检测第一次登陆时是不是节日
            if (SpecialDaysStr != "") {
                //diaoluehelper.addDialogueMessage("SimulationSystemTrader", DailyContent, sessionId, 每日奖励)
                switch (SpecialDaysStr) {
                    case "情人节":
                        {
                            diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLoginWithValentine", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 情人节);
                            Tip("You have a new mail.");
                        }
                        break;
                    case "圣诞节":
                        {
                            diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLoginWithChristmas", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 圣诞节);
                            Tip("You have a new mail.");
                        }
                        break;
                    case "感恩节":
                        {
                            diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLoginWithThxgvngDay", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 感恩节);
                            Tip("You have a new mail.");
                        }
                        break;
                    case "母亲节":
                        {
                            diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLoginWithMothersDay", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 母亲节);
                            Tip("You have a new mail.");
                        }
                        break;
                    case "公历新年":
                        {
                            diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLoginWithNewYear", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 新年);
                            Tip("You have a new mail.");
                        }
                        break;
                    case "万圣节":
                        {
                            diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLoginWithHalloween", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 万圣节);
                            Tip("You have a new mail.");
                        }
                        break;
                }
            }
            else {
                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageFirstLogin", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 每日奖励);
                Tip("You have a new mail.");
            }
        }
        //if data == true
        else {
            //check if 24 hours later
            if ((Date.now() - Timer[sessionId].Time) >= 86400000 && Timer[sessionId].firstlogin == false) {
                Timer[sessionId].firstlogin == true;
            }
            //check if first login or 24 hours later
            if (Timer[sessionId].firstlogin == true || (Date.now() - Timer[sessionId].Time) >= 86400000) {
                Timer[sessionId].Time = Date.now();
                Timer[sessionId].Year = now.getFullYear();
                Timer[sessionId].Month = now.getMonth() + 1;
                Timer[sessionId].Day = now.getDate();
                Timer[sessionId].count += 1;
                if (now.getDay() == 0) {
                    Timer[sessionId].Week = 7;
                }
                else {
                    Timer[sessionId].Week = now.getDay();
                }
                Timer[sessionId].firstlogin = false;
                //write file
                VFS.writeFile(`${ModPath}timer.json`, JSON.stringify(Timer, null, 4));
                if (SpecialDaysStr != "") {
                    //diaoluehelper.addDialogueMessage("SimulationSystemTrader", mesaagecontentfirst, sessionId, ItemArr)
                    switch (SpecialDaysStr) {
                        case "情人节":
                            {
                                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageValentine", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 情人节);
                                Tip("You have a new mail.");
                            }
                            break;
                        case "圣诞节":
                            {
                                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageChristmas", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 圣诞节);
                                Tip("You have a new mail.");
                            }
                            break;
                        case "感恩节":
                            {
                                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageThxgvngDay", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 感恩节);
                                Tip("You have a new mail.");
                            }
                            break;
                        case "母亲节":
                            {
                                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageMothersDay", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 母亲节);
                                Tip("You have a new mail.");
                            }
                            break;
                        case "公历新年":
                            {
                                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageNewYear", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 新年);
                                Tip("You have a new mail.");
                            }
                            break;
                        case "万圣节":
                            {
                                diaoluehelper.addDialogueMessage("SimulationSystemTrader", diaoluehelper.createMessageContext("SystemMessageHalloween", MessageType_1.MessageType.SYSTEM_MESSAGE, 24), sessionId, 万圣节);
                                Tip("You have a new mail.");
                            }
                            break;
                    }
                }
                else if (Timer[sessionId].count >= 7 && Timer[sessionId].count % 7 == 0) {
                    //累积周
                    diaoluehelper.addDialogueMessage("SimulationSystemTrader", WeeklyContent, sessionId, 每周奖励);
                    Tip("You have a new mail.");
                }
                else if (Timer[sessionId].count >= 30 && Timer[sessionId].count % 30 == 0) {
                    //累积月
                    diaoluehelper.addDialogueMessage("SimulationSystemTrader", MonthlyContent, sessionId, 每月奖励);
                    Tip("You have a new mail.");
                }
                else {
                    diaoluehelper.addDialogueMessage("SimulationSystemTrader", DailyContent, sessionId, 每日奖励);
                    Tip("You have a new mail.");
                }
                //sent mails
                //diaoluehelper.addDialogueMessage("SimulationSystemTrader", mesaagecontent, sessionId, ItemArr)
                //console.log("log-in")
            }
        }
        每日奖励 = [];
        每周奖励 = [];
        每月奖励 = [];
        情人节 = [];
        圣诞节 = [];
        万圣节 = [];
        新年 = [];
        感恩节 = [];
        母亲节 = [];
        //diaoluehelper.addDialogueMessage("SimulationSystemTrader", DebugContent, sessionId, DebugAttachment)
        DebugAttachment = [];
        SpecialDaysStr = "";
    }
    registerProfileImage(preAkiModLoader, imageRouter) {
        const imageFilepath = `./${preAkiModLoader.getModPath("SystemGift")}db/avatar`;
        imageRouter.addRoute(baseJson2.avatar.replace(".png", ""), `${imageFilepath}/SimulationSystemTrader.png`);
    }
}
module.exports = { mod: new Mod() };
