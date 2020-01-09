// ==UserScript==
// @name         云顶脚本测试
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       LT
// @match        http://joucks.cn:3344/
// @grant        none
// ==/UserScript==

var cookie = '';
var userInfo = {
    name: '',
    level: 0,
    exp: 0,
    fagitue: 0,
};

(function () {
    if (!window.localStorage) {
        alert('不支持这个浏览器，请换成Chrome或者Safari。');
        return null;
    }

    var textEle = document.createElement("P");
    textEle.appendChild(document.createTextNode("测试"));
    textEle.style.lineheight = "50px";
    textEle.style.color = "white";
    textEle.style.fontSize = "30px";
    textEle.style.padding = "10px 20px";
    textEle.style.background = "green";
    textEle.style.position = "fixed";
    textEle.style.right = "30px";
    textEle.style.top = "300px";
    textEle.style.zIndex = "10000";

    var button1 = document.createElement("button");
    button1.innerHTML = '测试按钮';
    textEle.appendChild(button1);

    //绑定点击事件
    button1.onclick = function () {
        startAutoFinishFactionTask();
    };

    var container = document.querySelector('body');
    container.appendChild(textEle);

    getUserInfo();
    runBasicCycle();

})();

// --- 基础功能 ---

// 基础循环逻辑
function runBasicCycle() {
    var cur_time = 0;
    setInterval(() => {
        cur_time = cur_time + 1;
        // 1秒执行一次

        // 2秒执行一次
        if (cur_time % 2 == 0) {
            // 拍卖行扫货
            searchAndBuyCheapGoods();
            startAutoFinishFactionTask();
        }

        // 5秒执行一次
        if (cur_time % 5 == 0) {

        }

        // 30秒执行一次
        if (cur_time % 30 == 0) {
            // 检测是否在自动打怪
        }

        // 一分钟执行一次
        if (cur_time % 60 == 0) {
            // 卖低于未鉴定物品
            // sellUnIdentifyGoods();
            // 重置倒计时 避免越界
            cur_time = 0;
        }
    }, 1000);
}

// 登陆
function userLogin() {
    var user_name = 'longteng@gmail.com';
    var pass_word = 'lt19950416';

    $.post("/api/login", { user_name: user_name, user_pwd: pass_word }, function (data) {
        if (data.code == 200) {
            location.href = "/"
        } else {
            alert(data.msg)
        }
    })
};

// 获取用户信息
function getUserInfo() {
    fetch('http://joucks.cn:3344/api/getUserInitInfo', {
        method: "GET",
        headers: {
            'Cookie': cookie,
        }
    }).then(function (response) {
        return response.json()
    }).then(function (res) {
        var tempUser = res.data.user;
        userInfo.name = tempUser.nickname;
        userInfo.level = tempUser.level;
        userInfo.exp = tempUser.repair_num;
        userInfo.fagitue = tempUser.health_num;
    })
}

// 获取物品信息
function getUserGoods(func_a, func_end) {
    fetch("http://joucks.cn:3344/api/getUserGoods", {
        method: "GET",
        headers: {
            'Cookie': cookie,
        }
    }).then(function (response) {
        return response.json()
    }).then(function (res) {
        var pages = res.pages;
        for (var j = 1; j < pages + 1; j++) {
            fetch("http://joucks.cn:3344/api/getUserGoods?page=" + j, {
                method: "GET",
                headers: {
                    'Cookie': cookie,
                }
            }).then(function (response) {
                return response.json()
            }).then(function (res) {
                for (var i = 0; i < res.data.length; i++) {
                    if (res.data[i].goods != null && func_a != null) {
                        func_a(res.data[i]);
                    }
                }
                // 完成后回调
                if (res.pages == pages && func_end != null) {
                    func_end();
                }
            })
        }
    })
}

// 卖物品
// 格式 json数组
// [{
//     "id": "123",
//     "count": "123",
//     "name": "name",
//     "style": "style",
// }]
function sellGoods(goodsJson) {
    fetch("http://joucks.cn:3344/api/sellGoods", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            'Cookie': cookie,
        },
        body: `sell_json=` + goodsJson + `&sell_type=wqp`
    }).then(function (response) {
        return response.json()
    }).then(function (res) {
        console.log('卖物品:' + res + ' 内容:' + goodsJson);
    });
}

// 使用物品
function useGood(id) {
    fetch("http://joucks.cn:3344/api/useGoodsToUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            'Cookie': cookie,
        },
        body: 'ugid=' + id
    }).then(function (response) {
    }).then(function (res) {
        console.log(res)
    });
}

// 合成物品
function makeGood(goods_json) {
    $.post("http://joucks.cn:3344/api/makeGoods",
        {
            sell_json: JSON.stringify(goods_json),
            sell_type: 'make'
        },

        function (data) {
            console.log('makeGood log:' + data.msg);
        })
}

// 获取拍卖行物品
function getSellGoods(func_a, page) {
    if (page < 1) {
        return;
    }

    // sortType 1上架倒序 2上架顺序 3金币倒序 4金币正序
    fetch("http://joucks.cn:3344/api/getSellGoods?sortType=1&pageIndex=" + page + "&tid=all", {
        method: "GET",
        headers: {
            'Cookie': cookie,
        }
    }).then(function (response) {
        return response.json()
    }).then(function (res) {
        var sellGoods = res.data.playerSellUser;
        for (var i = 0; i < sellGoods.length; i++) {
            if (sellGoods[i].goods != null && func_a != null) {
                func_a(sellGoods[i]);
            }
        }
    })
}

// 购买拍卖行物品 type为1表示购买单个
function buySellGood(id, type, pwd) {
    var body = { pwd: pwd ? pwd : "", usgid: id };
    if (type == '1') {
        body.type = type;
    }

    $.post("http://joucks.cn:3344/api/byPalyerGoods",
        body,

        function (data) {
            console.log('buySellGood log:' + data.msg);
        })
}

// 获取帮派任务
function getFactionTask(funcA) {
    fetch("http://joucks.cn:3344/api/getFationTask", {
        method: "GET",
        headers: {
            'Cookie': cookie,
        }
    }).then(function (response) {
        return response.json()
    }).then(function (res) {
        if (funcA != null) {
            console.log('领取帮派任务log:' + res.msg);
            funcA(res);
        }
    })
}

// 获取个人任务列表
function getUserTasks(funcA) {
    fetch("http://joucks.cn:3344/api/getUserTask", {
        method: "GET",
        headers: {
            'Cookie': cookie,
        }
    }).then(function (response) {
        return response.json()
    }).then(function (res) {
        if (funcA != null) {
            funcA(res.data);
        }
    })
}

// 放弃任务
function giveUpTask(taskId, funcResult) {
    if (taskId == null) {
        return;
    }
    var body = { tid: taskId };
    $.post("http://joucks.cn:3344/api/closeUserTask",
        body,
        function (data) {
            if (funcResult != null) {
                funcResult(data);
            }
        })
}

// 完成任务
function finishTask(taskId, funcResult) {
    if (taskId == null) {
        return;
    }
    var body = { utid: taskId };
    $.post("http://joucks.cn:3344/api/payUserTask",
        body,
        function (data) {
            if (funcResult != null) {
                console.log('完成任务:' + data.msg);
                funcResult(data);
            }
        })
}



// --- 各种操作 ---

// 合成神龙经验值
function makeExpGood() {
    var min_count = 0;
    var canhun_type_count = 0;  // 残魂碎片类型个数，如果背包有7个类型的残魂碎片就允许合成
    var temp_func = function (data) {
        if (data.goods.name.indexOf("残魂碎片") > -1) {
            canhun_type_count += 1;
            if (min_count == 0) {
                min_count = data.count;
            } else if (min_count > data.count) {
                min_count = data.count;
            }
        }
    };

    var func_end = function () {
        if (canhun_type_count != 7) {
            console.log('缺少残魂碎片');
            return;
        }
        var temp_json = [
            { "id": "5dfd9e016b88a93e0325787a", "count": min_count, "name": "残魂碎片一", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" },
            { "id": "5dfdc0c96b88a93e03257e6c", "count": min_count, "name": "残魂碎片七", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" },
            { "id": "5dfdb788ef66963dfd478059", "count": min_count, "name": "残魂碎片六", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" },
            { "id": "5dfd9dc1ef66963dfd477c33", "count": min_count, "name": "残魂碎片三", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" },
            { "id": "5dfdad013a87750ec661c5f3", "count": min_count, "name": "残魂碎片四", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" },
            { "id": "5dfdaccb3a87750ec661c5e1", "count": min_count, "name": "残魂碎片五", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" },
            { "id": "5dfd9ddcee5fe13e0b22e190", "count": min_count, "name": "残魂碎片二", "style": "text-shadow:1px 1px px dimgray;color:dimgray;background-color:beige;" }
        ];
        makeGood(temp_json);
    }

    getUserGoods(temp_func, func_end);
}

// 合成竹叶碎青


// 合成占星珠


// 卖未鉴定的装备(用户等级大于55才卖)
function sellUnIdentifyGoods() {
    // if (userInfo.level < 55) {
    //     return;
    // }
    var sell_goods = [];
    var func_temp = function (data) {
        if (data.goods.name.indexOf("鉴") > -1 && data.goods.is_sell == "0") {
            var temp_good = {};
            temp_good["id"] = data._id;
            temp_good["count"] = data.count + "";
            temp_good["name"] = data.goods.name;
            temp_good["style"] = data.goods.style;
            sell_goods.push(temp_good);
        }
    }

    var func_end = function () {
        if (sell_goods.count > 0) {
            sellGoods(JSON.stringify(sell_goods));
        }
    }

    getUserGoods(func_temp, func_end);
}

// 寻找并购买低价宠物丹、技能书、玄铁块
function searchAndBuyCheapGoods() {
    // 单价<=1金叶的物品名字数组
    var oneNameArray = ['蚊针', '蛇皮', '蜥血', '豹子胆'];

    // 单价<=3金叶的物品名字数组
    var threeNameArray = ['宠物升级丹', '虎胆'];

    // 单价<=5金叶的物品名字数组
    var fiveNameArray = ['龟壳', '魂魄珠', '占卜星', '贝壳', '技-', '基础器灵', '鉴', '70级', '玄铁块', '资金玄铁', '精炼玄铁', '麒麟', '强化石', '神龙的信仰', '大鹏精血'];

    // 怎么都不要买的黑名单名字数组
    var blackListNameArray = ['祥瑞玉兔'];

    var func_a = function (data) {
        if (data.user.nickname == userInfo.name || data.isPwd == true) {
            return;
        }
        var i = 0;
        var name = '';

        // 黑名单的物品直接return
        for (i = 0; i < blackListNameArray.length; i++) {
            name = blackListNameArray[i];
            if (data.goods.name.indexOf(name) > -1) {
                return;
            }
        }

        // 单价小于1金叶的就购买
        for (i = 0; i < oneNameArray.length; i++) {
            name = oneNameArray[i];
            if (data.goods.name.indexOf(name) > -1 && data.game_gold / data.count <= 1) {
                console.log('扫描到物品:' + data.goods.name + ' ,数量:' + data.count + ' ,单价:' + data.game_gold / data.count);
                buySellGood(data._id, '', '');
            }
        }

        // 单价小于3金叶的就购买
        for (i = 0; i < threeNameArray.length; i++) {
            name = threeNameArray[i];
            if (data.goods.name.indexOf(name) > -1 && data.game_gold / data.count <= 3) {
                console.log('扫描到物品:' + data.goods.name + ' ,数量:' + data.count + ' ,单价:' + data.game_gold / data.count);
                buySellGood(data._id, '', '');
            }
        }

        // 单价小于5金叶的就购买
        for (i = 0; i < fiveNameArray.length; i++) {
            name = fiveNameArray[i];
            if (data.goods.name.indexOf(name) > -1 && data.game_gold / data.count <= 5) {
                console.log('扫描到物品:' + data.goods.name + ' ,数量:' + data.count + ' ,单价:' + data.game_gold / data.count);
                buySellGood(data._id, '', '');
            }
        }

        if (data.goods.name.indexOf('麒麟碎片') > -1 && data.goods.name.indexOf('土') > -1 && data.game_gold / data.count <= 30000) {
            // 单价小于3w金叶的麒麟土碎片
            console.log('扫描到物品:' + data.goods.name + ' ,数量:' + data.count + ' ,单价:' + data.game_gold / data.count);
            buySellGood(data._id, '1', '');
        }

        if (data.goods.name.indexOf('麒麟碎片') > -1 && data.goods.name.indexOf('火') > -1 && data.game_gold / data.count <= 7000) {
            // 单价小于7000金叶的麒麟火碎片
            console.log('扫描到物品:' + data.goods.name + ' ,数量:' + data.count + ' ,单价:' + data.game_gold / data.count);
            buySellGood(data._id, '1', '');
        }
    }

    getSellGoods(func_a, 1);
}

// 自动做帮派任务
function startAutoFinishFactionTask() {
    var blackListTaskNameArray = ['藏书阁', '百万宠物丹', '寻找精血', '大量火石储备', '药房储备'];
    // 先检查自己的任务列表有没有帮派任务
    var funcFindMyFactionTask = function (taskList) {
        taskList.forEach(task => {
            // 是帮派任务
            if (task.task.task_type == 4) {
                // 判断这些帮派任务是不是值得做的几个之一
                var isInBlackList = false;
                blackListTaskNameArray.forEach(name => {
                    // 如果在黑名单中，就放弃任务
                    if (task.task.name.indexOf(name) > -1) {
                        isInBlackList = true;
                        giveUpTask(task.utid, null);
                    }
                });
                if (!isInBlackList) {

                    // 尝试完成任务
                    finishTask(task.utid, function (res) {
                        // 完成失败就放弃
                        if (res.code != 200) {
                            giveUpTask(task.utid, null);
                        }
                    });

                }
            }
        });
    };

    // 先拉一次帮派任务 无论成功或者失败就开始做帮派任务
    getFactionTask(function (res) {
        getUserTasks(funcFindMyFactionTask);
    });
}
