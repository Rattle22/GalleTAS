var doBeautify = true;
function beaut(number) {
    return doBeautify ? Beautify(number) : number;
}

function round(num) {
    return Math.round(num * 1000) / 1000;
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
    Game.CalculateGains();
}

function addObject(obj, amount = 1) {
    if(!Game.Objects[obj]) throw new Expection("Unknown object " + obj);
    Game.Objects[obj].amount += amount;
    Game.CalculateGains();
}

function addUpgrade(up, amount = 1) {
    if(!Game.Upgrades[up]) throw new Expection("Unknown upgrade " + up);
    if(Game.Upgrades[up].owned) throw new Expection("Upgrade already owned: " + up);
    if(Game.Upgrades[up].pool === "debug") return;
    Game.Upgrades[up].earn();
    Game.CalculateGains();
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
        prepareEnv = () => {
            wipe();
            addUpgrade("\"egg\""); // Makes sure that cps based calculations do not run into 0 issues.
        }
        
        for(let b in Game.Objects) {
            prepareEnv();
            let wrapped = wrapBuilding(Game.Objects[b].id);
            let predictedCps = wrapped.getCps() + Game.cookiesPs;

            addObject(b, 1);
            
            assert(Game.cookiesPs === predictedCps, "CPS unequal.\nPredicted: " + beaut(predictedCps) + "\nActual: " + beaut(Game.cookiesPs));
        }
    },
    objectWrappersCookieUpgrade: (assert) => {
        prepareEnv = () => {
            wipe();
            addUpgrade("\"egg\""); // Makes sure that cps based calculations do not run into 0 issues.
            addUpgrade("Cosmic chocolate butter biscuit");
        }
        
        for(let b in Game.Objects) {
            prepareEnv();
            let wrapped = wrapBuilding(Game.Objects[b].id);
            let predictedCps = wrapped.getCps() + Game.cookiesPs;

            addObject(b, 1);
            
            assert(round(Game.cookiesPs) === round(predictedCps), "CPS unequal.\nPredicted: " + beaut(predictedCps) + "\nActual: " + beaut(Game.cookiesPs));
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
            let predictedCps = wrapped.getCps();

            addObject(b, 1);
            
            assert(Game.cookiesPs === predictedCps, "CPS unequal.\nPredicted: " + beaut(predictedCps) + "\nActual: " + beaut(Game.cookiesPs));
        }
    },*/
}

function runTest(testname, test){
    var messages = [];
    let assert = function(bool, msg) {
        if(!bool) messages.push(msg);
    }
    try {
        test(assert);
    } catch(e) {
        console.error("There was an error executing " + testname);
        console.error(e, e.stack);
        return;
    }
    if(messages.length > 0){
        console.error(testname + " failed with " + messages.length + " errors:");
        messages.forEach(msg => console.error(msg));
        return false;
    } else {
        console.info(testname + " passed!")
        return true;
    };
}

function runTests(stopOnError) {
    for(test in tests){
        wipe();
        console.info("============== RUNNING TEST " + test + " ==============");
        if(!runTest(test, tests[test]) && stopOnError) return;
    }
}

runTests();