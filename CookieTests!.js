function wrap(name, cps, cost, available, buyFunc = () => {}){
    let wrapper = {};
    wrapper.getName = () => name;
    wrapper.getCps = () => cps;
    wrapper.getPrice = () => cost;
    wrapper.available = () => available;
    wrapper.buy = buyFunc;
    return wrapper;
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
    } else console.info(testname + " passed!");
}

function runTests() {
    Game.HardReset(3);
    for(test in tests){
        console.info("============== RUNNING TEST " + test + " ==============");
        runTest(test, tests[test]);
        Game.HardReset(3);
    }
}

runTests();