var doBeautify = false;
function beaut(number) {
    return doBeautify ? Beautify(number) : number;
}

function fuzzyEq(left, right) {
    var diff = 0;
    if(left != 0) {
        diff = (right/left) - 1;
    } else if(left != right) {
        diff = (right/left) - 1;
    }
    return Math.abs(diff) < 0.001;
}

function currentCps() {
    return Game.cookiesPs + Game.computedMouseCps * targetClicksPerSecond;
}

function wrap(name, cps, cost, available, buyFunc = () => {}){
    let wrapper = {};
    wrapper.getName = () => name;
    wrapper.getCps = () => cps;
    wrapper.getPrice = () => cost;
    wrapper.available = () => available;
    wrapper.buy = buyFunc;
    return wrapper;
}

function wipe() {
    Game.HardReset(3);
    Game.Win("Hardcore");
    Game.Win("Neverclick");
    Game.CalculateGains();
}

function addObject(obj, amount = 1) {
    if(!Game.Objects[obj]) throw "Unknown object " + obj;
    Game.Objects[obj].amount += amount;
    Game.CalculateGains();
}

function addUpgrade(up, amount = 1) {
    if(!Game.Upgrades[up]) throw "Unknown upgrade " + up;
    if(Game.Upgrades[up].owned) throw "Upgrade already owned: " + up;
    if(Game.Upgrades[up].pool === "debug") return;
    Game.Upgrades[up].earn();
    Game.CalculateGains();
}

function addAchievement(ach, amount = 1) {
    if(!Game.Achievements[ach]) throw "Unknown Achievement " + ach;
    if(Game.Achievements[ach].won) throw "Achievement already owned: " + ach;
    Game.Win(ach);
    Game.CalculateGains();
}

var env = {};
env.custom = (c) => {
    c();
    return env;
};
env.withGlobalMult = (useOtherCookie) => {
    if(useOtherCookie) addUpgrade("Plain cookies");
    else addUpgrade("Cosmic chocolate butter biscuit");
    return env;
};
env.withAdequateBuilding = (cps) => {
    for(let obj in Game.ObjectsById) {
        obj = Game.ObjectsById[obj];
        if(obj.baseCps < cps) {
            addObject(obj.name);
        } else break;
    }
    return env;
};
env.withBuilding = (building) => {
    if(!building) { //The non building tie upgrades are either cursors, or ritual rolling pins.
        addObject("Cursor");
        addObject("Grandma");
    } else {
        addObject(building.name);
    }
    return env;
};
env.build = () => {
    Game.CalculateGains();
}

function initEnv(){
    wipe();
    addUpgrade("\"egg\""); // Makes sure that cps based calculations do not run into 0 division issues.
    return env;
}

var tests = {
/*===================================================
BUY LOGIC TESTS
===================================================*/
//{
    findQuickestSameCpsLessExpensive: (assert) => {
        var bought = 0;
        let better = wrap("better", 1, 100, true, () => { bought += 1; });
        let wrappers = [
            wrap("worse!", 1, 1000, true),
            better
        ];
        
        let quickest = findQuickest(wrappers);
        
        assert(better === quickest, "Best was not chosen!");
    },
    findQuickestMoreCpsSamePrice: (assert) => {
        var bought = 0;
        let better = wrap("better", 2, 100, true, () => { bought += 1; });
        let wrappers = [
            wrap("worse!", 1, 100, true),
            better
        ];
        
        let quickest = findQuickest(wrappers);
        
        assert(better === quickest, "Best was not chosen!");
    },
    findQuickestSameEfficiencyLessExpensive: (assert) => {
        var bought = 0;
        let better = wrap("better", 1, 100, true, () => { bought += 1; });
        let wrappers = [
            wrap("worse!", 2, 200, true),
            better
        ];
        
        let quickest = findQuickest(wrappers);
        
        assert(better === quickest, "Best was not chosen!");
    },
    buyOptimallySameCpsLessExpensive: (assert) => {
        var bought = 0;
        let wrappers = [
            wrap("worse!", 1, 1000, true),
            wrap("better", 1, 100, true, () => { bought += 1; })
        ];
        
        buyOptimally(wrappers, 1, () => {
            if(bought) return 0;
            return 100;
        });
        
        assert(bought > 0, "Object was not bought!");
        assert(bought < 2, "Object was bought too often!");
    },
    buyOptimallyLessCpsPaysForItself: (assert) => {
        var bought = 0;
        let wrappers = [
            wrap("worse!", 200, 15000, true),
            wrap("better", 1, 100, true, () => { bought += 1; })
        ];
        
        buyOptimally(wrappers, 1, () => {
            if(bought) return 0;
            return 100;
        });
        
        assert(bought > 0, "Object was not bought!");
        assert(bought < 2, "Object was bought too often!");
    },

//}
/*===================================================
    OBJECT WRAPPER TESTS
===================================================*/
//{
    objectWrappersNoUpgrades: (assert) => {
        
        for(let b in Game.Objects) {
            initEnv().build();
            let wrapped = wrapBuilding(Game.Objects[b].id);
            let predCps = wrapped.getCps() + currentCps();

            addObject(b, 1);
            
            assert(fuzzyEq(currentCps(), predCps), "CPS unequal for object " + b + ".\nPred: " + beaut(predCps) + "\nActl: " + beaut(currentCps()));
        }
    },
    objectWrappersGlobalCpsMult: (assert) => {        
        for(let b in Game.Objects) {
            initEnv()
                .withGlobalMult()
                .build();
            let wrapped = wrapBuilding(Game.Objects[b].id);
            let predCps = wrapped.getCps() + currentCps();

            addObject(b, 1);
            
            assert(fuzzyEq(currentCps(), predCps), "CPS unequal for object " + b + ".\nPred: " + beaut(predCps) + "\nActl: " + beaut(currentCps()));
        }
    },

//}
/*===================================================
    UPGRADE WRAPPER TESTS
===================================================*/
//{
    simpleUpgradeWrappers: (assert) => {        
        for(let up in Game.Upgrades) {
            if(isGrandma(Game.Upgrades[up]) || !isSimple(Game.Upgrades[up])) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withBuilding(Game.Upgrades[up].buildingTie)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    simpleUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(isGrandma(Game.Upgrades[up]) || !isSimple(Game.Upgrades[up])) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withBuilding(Game.Upgrades[up].buildingTie)
                .withGlobalMult()
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    cookieUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isCookie(Game.Upgrades[up])) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    cookieUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isCookie(Game.Upgrades[up])) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult(up === "Cosmic chocolate butter biscuit")
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    grandmaUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isCookie(Game.Upgrades[up])) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    grandmaUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isCookie(Game.Upgrades[up])) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult(up === "Cosmic chocolate butter biscuit")
                .withBuilding(Game.Upgrades[up].buildingTie)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    /* Loooooong way to go for this one
    objectWrappersAllUpgrades: (assert) => {
        prepareEnv = () => {
            wipe();
            for(let up in Game.Upgrades)
                addUpgrade(up);
        }
        
        for(let b in Game.Objects) {
            prepareEnv();
            let wrapped = wrapBuilding(Game.Objects[b].id);
            let predCps = wrapped.getCps();

            addObject(b, 1);
            
            assert(currentCps() === predCps, "CPS unequal.\nPred: " + beaut(predCps) + "\nActl: " + beaut(currentCps()));
        }
    },*/
}

function runTest(test, stopOnError){
    var messages = [];
    let assert = function(bool, msg) {
        if(!bool) { 
            messages.push(msg);
            if(stopOnError) throw "Assertion Error! Stopping for error.";
        }
    }
    try {
        test(assert);
    } catch(e) {
        console.error(e, e.stack);
        return false;
    }
    if(messages.length > 0){
        messages.forEach(msg => console.error(msg));
        return false;
    } else {
        return true;
    };
}

function runTests(stopOnError) {
    for(test in tests){
        console.groupCollapsed("============== RUNNING TEST " + test + " ==============");
        let wasSuccessful = runTest(tests[test], stopOnError);
        console.groupEnd();
        if(!wasSuccessful) {
            console.warn("=============== FAILED TEST " + test + " ==============");
            if(stopOnError)return;
        } else console.info("=============== PASSED TEST " + test + " ==============");
    }
}

//runTests(false);