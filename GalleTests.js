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
    return withShimmerBonus(Game.cookiesPs + Game.computedMouseCps * targetClicksPerSecond);
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

function addUpgrade(up) {
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

function addPrestige(amount) {
    Game.prestige += amount;
    Game.CalculateGains();
}

var env = {};
env.custom = (c) => {
    c();
    return env;
};
var defaultGlobal = "Cosmic chocolate butter biscuit";
env.withGlobalMult = (useOtherCookie = false) => {
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
env.withBuilding = (building, amount = 1) => {
    if(!building) { //The non building tie upgrades are either cursors, or ritual rolling pins.
        addObject("Cursor", amount);
        addObject("Grandma", amount);
    } else {
        addObject(building.name, amount);
    }
    return env;
};
env.withPrestige = (amount = 75) => {
    addPrestige(amount);
    return env;
};
var defaultMouse = "Plastic mouse";
env.withMouse = (useOtherMouse = false) => {
    if(!useOtherMouse) addUpgrade("Plastic mouse");
    else addUpgrade("Iron mouse");
    return env;
};
env.build = () => {
    Game.CalculateGains();
}

function initEnv(noEgg = false){
    wipe();
    if(!noEgg) addUpgrade("\"egg\""); // Makes sure that cps based calculations do not run into 0 division issues.
    return env;
}

function isDifferent(up) {
    return up.pool === "prestige" || up.pool === "debug";
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
    objectWrappersWithGlobalMult: (assert) => {        
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
    objectWrappersWithMouse: (assert) => {        
        for(let b in Game.Objects) {
            initEnv()
                .withMouse()
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
            if(isGrandma(Game.Upgrades[up]) || !isSimple(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
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
            if(isGrandma(Game.Upgrades[up]) || !isSimple(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
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
    simpleUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(isGrandma(Game.Upgrades[up]) || !isSimple(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withBuilding(Game.Upgrades[up].buildingTie)
                .withMouse()
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
            if(!isCookie(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
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
            if(!isCookie(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult(up === defaultGlobal)
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    cookieUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isCookie(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse()
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
            if(!isGrandma(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withBuilding(bGrandma, 100)
                .withBuilding(Game.Upgrades[up].buildingTie)
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
            if(!isGrandma(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult()
                .withBuilding(bGrandma, 100)
                .withBuilding(Game.Upgrades[up].buildingTie)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    grandmaUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isGrandma(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse()
                .withBuilding(bGrandma, 100)
                .withBuilding(Game.Upgrades[up].buildingTie)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    mouseUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isMouse(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withBuilding(bCursor, 55)
                .withBuilding(bGrandma, 10)
                .withAdequateBuilding(bFarm, 10)
                .withAdequateBuilding(bFactory, 3)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    mouseUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isMouse(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    mouseUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isMouse(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse(up === defaultMouse)
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    fingerUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isFinger(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
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
    fingerUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isFinger(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    fingerUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isFinger(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    kittenUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isKitten(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
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
    kittenUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isKitten(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    kittenUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isKitten(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    prestigeUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isHeavenly(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withAdequateBuilding(3000)
                .withPrestige()
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    prestigeUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isHeavenly(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult()
                .withAdequateBuilding(3000)
                .withPrestige()
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    prestigeUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isHeavenly(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse()
                .withAdequateBuilding(3000)
                .withPrestige()
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    prestigeUpgradeWrappersNoPrestige: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isHeavenly(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
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
    prestigeUpgradeWrappersWithGlobalMultNoPrestige: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isHeavenly(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withGlobalMult()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    prestigeUpgradeWrappersWithMouseNoPrestige: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isHeavenly(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv()
                .withMouse()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    eggUpgradeWrappers: (assert) => {
        for(let up in Game.Upgrades) {
            if(!isEgg(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv(up === "\"egg\"")
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    eggUpgradeWrappersWithGlobalMult: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isEgg(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv(up === "\"egg\"")
                .withGlobalMult()
                .withAdequateBuilding(3000)
                .build();
            let predictedBonus = wrapped.getCps();
            let cCps = currentCps();

            addUpgrade(up);
            let actBonus = currentCps() - cCps;
            
            assert(fuzzyEq(actBonus, predictedBonus), "CPS unequal for upgrade " + up + ".\nPred: " + beaut(predictedBonus) + "\nActl: " + beaut(actBonus));
        }
    },
    eggUpgradeWrappersWithMouse: (assert) => {        
        for(let up in Game.Upgrades) {
            if(!isEgg(Game.Upgrades[up]|| isDifferent(Game.Upgrades[up]))) continue;
            let wrapped = wrapUpgrade(up);
            if(!wrapped) throw up + " not handled!";
            
            initEnv(up === "\"egg\"")
                .withMouse()
                .withAdequateBuilding(3000)
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

runTests(false);