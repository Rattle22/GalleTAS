//}
/*===================================================
    CONFIGURATION
===================================================*/
//{

const autostart = false;
var targetClicksPerSecond = 10;
var shimmerClicksPerSecond = 2; //Should be > 1 for "Fading Luck" Achievement
var buysPerSecond = 2;
var marketInterval = 1; // In seconds.

function clicksPerSecond() {
    return targetClicksPerSecond * Game.HasAchiev("Neverclick");
}

//}
/*===================================================
    HELPFUL DEFINITIONS
===================================================*/
//{
const wrappers = [];

const goldenCookie = 'golden';

const buildings = [
    Game.ObjectsById[0],
    Game.ObjectsById[1],
    Game.ObjectsById[2],
    Game.ObjectsById[3],
    Game.ObjectsById[4],
    Game.ObjectsById[5],
    Game.ObjectsById[6],
    Game.ObjectsById[7],
    Game.ObjectsById[8],
    Game.ObjectsById[9],
    Game.ObjectsById[10],
    Game.ObjectsById[11],
    Game.ObjectsById[12],
    Game.ObjectsById[13],
    Game.ObjectsById[14],
    Game.ObjectsById[15],
    Game.ObjectsById[16],
];

const bCursor = Game.ObjectsById[0];
const bGrandma = Game.ObjectsById[1];
const bBank = Game.ObjectsById[5];
const bAlchemyLab = Game.ObjectsById[9];

const mouses = [
    Game.Upgrades["Plastic mouse"],
    Game.Upgrades["Iron mouse"],
    Game.Upgrades["Titanium mouse"],
    Game.Upgrades["Adamantium mouse"],
    Game.Upgrades["Unobtainium mouse"],
    Game.Upgrades["Eludium mouse"],
    Game.Upgrades["Wishalloy mouse"],
    Game.Upgrades["Fantasteel mouse"],
    Game.Upgrades["Nevercrack mouse"],
    Game.Upgrades["Armythril mouse"],
    Game.Upgrades["Technobsidian mouse"],
    Game.Upgrades["Plasmarble mouse"],
    Game.Upgrades["Miraculite mouse"],
];

const fingers = [
    Game.Upgrades["Thousand fingers"],
    Game.Upgrades["Million fingers"],
    Game.Upgrades["Billion fingers"],
    Game.Upgrades["Trillion fingers"],
    Game.Upgrades["Quadrillion fingers"],
    Game.Upgrades["Quintillion fingers"],
    Game.Upgrades["Sextillion fingers"],
    Game.Upgrades["Septillion fingers"],
    Game.Upgrades["Octillion fingers"],
    Game.Upgrades["Nonillion fingers"],
];

function prebuffMult() {
    let noMultCps = Game.cookiesPs / Game.globalCpsMult; // Divide both normal boni and buffs out
    return Game.unbuffedCps / noMultCps; // Only the non buff mult remains
}

//}
/*===================================================
    CLICK LOGIC
===================================================*/
//{

function click() {
    if(!Game.HasAchiev("Tabloid addiction")) {
        Game.tickerL.click();
    } else if(!Game.HasAchiev("What\'s in a name")) {
        $("#bakeryName").click();
        $("#bakeryNameInput").value = "Rat";
        $("#promptOption0").click();
    } else if(!Game.HasAchiev("Here you go")) {
        Game.Achievements["Here you go"].click();
    } else if(!Game.HasAchiev("Tiny cookie")) {
        Game.ClickTinyCookie();
    } else if(!Game.HasAchiev("Olden days")) {
        $("#logButton").click();
        $("#menu").children[2].children[0].click();
    } else if(Game.HasAchiev("Neverclick") || Game.cookieClicks < 15) {
        Game.ClickCookie();
        if(!Game.HasAchiev("Uncanny Clicker")) {
            for(let i = 0; i < 17 - targetClicksPerSecond; i++) {
                Game.ClickCookie();
            }
        }
    }
}
        
function withClickingBonus(cps) {
    let bonus = mouses.reduce((total, mouse) => total + mouse.bought, 0);
    return cps * (1 + 0.01 * bonus);
}

//}
/*===================================================
    UPGRADE LOGIC
===================================================*/
//{

function getCookieCpsGetter(cookie) {
    return () => {
        return withClickingBonus(0.01 * cookie.power * Game.cookiesPsRaw);
    };
}

function getGrandmaCpsGetter(grandma) {
    return () => {
        let tieBuilding = grandma.buildingTie; 
        let bTieCps = tieBuilding.storedCps * 0.01 * bGrandma.amount / (tieBuilding.id - 2) ;
        return withClickingBonus(bGrandma.storedTotalCps + bTieCps);
    };
}

function getKittenCpsGetter(kitten) {
    let mult = 
    (kitten.name === 'Kitten helpers') ? 0.1 :
    (kitten.name === 'Kitten workers') ? 0.125 :
    (kitten.name === 'Kitten engineers') ? 0.15 :
    (kitten.name === 'Kitten overseers') ? 0.175 :
    (kitten.name === 'Kitten managers') ? 0.2 :
    (kitten.name === 'Kitten accountants') ? 0.2 :
    (kitten.name === 'Kitten specialists') ? 0.2 :
    (kitten.name === 'Kitten experts') ? 0.2 :
    (kitten.name === 'Kitten consultants') ? 0.2 :
    (kitten.name === 'Kitten assistants to the regional manager') ? 0.175 :
    (kitten.name === 'Kitten marketeers') ? 0.15 :
    (kitten.name === 'Kitten analysts') ? 0.125 :
    (kitten.name === 'Kitten executives') ? 0.115 :
    (kitten.name === 'Kitten angels') ? 0.1 : 0;
    return function() {
      return withClickingBonus(Game.milkProgress * mult * Game.cookiesPsRaw);  
    };
}

function getMouseCpsGetter(cookie) {
    return () => {
        return 0.01 * clicksPerSecond() * Game.cookiesPsRaw;
    };
}

function fingerPower(finger) {
    return 0.05 * Math.pow(10, finger.tier - 4) + (finger.tier === 4 ? 0.05 : 0);
}

function getFingersCpsGetter(finger) {
    return () => {
        let bonus = fingerPower(finger);
        let buildingCount = buildings.reduce((total, building) => total + building.amount, 0);
        buildingCount -= bCursor.amount;
        return buildingCount * bonus * bCursor.amount;
    };
}

function getSimpleUpgradeCpsGetter(simple) {
    if(simple.id <= 2) { //The first three upgrades have no building tie...
        return () => {
            let cursorCps = bCursor.storedTotalCps;
            let buildingBonus = withClickingBonus(cursorCps) * 2 - cursorCps;
            
            let mouseCpsBonus = Game.cookiesPsRaw * 0.01 * mouses.reduce((total, mouse) => total + mouse.bought, 0);
            let clickingBonus = (Game.computedMouseCps - mouseCpsBonus) * clicksPerSecond();
            
            return clickingBonus + buildingBonus; //...and improve clicks
        }
    }
    return () => {
        return withClickingBonus(simple.buildingTie.storedTotalCps);
    };
}

function isSimpleUpgrade(up) {
    return up.desc.includes(" are <b>twice</b> as efficient.") || up.desc.includes(" are twice as productive.");
}

function wrapUpgrade(id) {
    let u = Game.Upgrades[id];
    let wrapper = {};
    wrapper.getPrice = () => { return u.getPrice(); };
    wrapper.buy = (bulk) => {
        u.buy();
    }
    wrapper.getName = () => {
        return "Upgrade: " + u.name;
    }
    
    if(u.pool == "cookie") {
        wrapper.getCps = getCookieCpsGetter(u);
    }
    else if(u.name.includes("grandmas")) {
        wrapper.getCps = getGrandmaCpsGetter(u);
    }
    else if(u.name.includes("Kitten")) {
        wrapper.getCps = getKittenCpsGetter(u);
    }
    else if(u.name.includes("mouse")) {
        wrapper.getCps = getMouseCpsGetter(u);
    }
    else if(u.name.includes(" fingers")) { //Space to exclude Ladyfingers
        wrapper.getCps = getFingersCpsGetter(u);
    }
    else if(isSimpleUpgrade(u)) { // Must come after grandma upgrade check due to simpleUpgrade implementation.
        wrapper.getCps = getSimpleUpgradeCpsGetter(u);
    }
    
    if(!wrapper.getCps) {
        wrapper.getCps = () => 0;
    }
    
    wrapper.available = function() { return u.unlocked && !u.bought && Game.HasAchiev("Hardcore"); };
    wrapper.canBuyAgain = false;
    return wrapper;
}

//}
/*===================================================
    BUILDING LOGIC
===================================================*/
//{

function fingersBonus() {
    let bonus = fingers.reduce((total, finger) => total + (finger.bought ? fingerPower(finger) : 0), 0);
    return bonus;
}

function wrapBuilding(id) {
    let b = Game.ObjectsById[id];
    let wrapper = {};
    wrapper.getPrice = function() {
        return b.price;
    }
    wrapper.getCps = function() {
        return withClickingBonus(b.cps(b) + fingersBonus());
    }
    wrapper.buy = function(bulk) {
        b.buy(bulk);
    }
    wrapper.getName = function() {
        return "Building: " + b.name;
    }
    wrapper.available = function() { return true; };
    wrapper.canBuyAgain = true;
    return wrapper;
}

//}
/*===================================================
    BUY LOGIC
===================================================*/
//{

// The quickest is that which pays for itself after the shortest amount of time.
function findQuickest(objects) {
    let best;
    let soonestRepay = Number.MAX_VALUE;
    let lowestPrice = Number.MAX_VALUE;
    for(let obj in objects) {
        obj = objects[obj];
        if(!obj.available()) continue;
        
        let repay = obj.getPrice() / obj.getCps();
        if (repay < soonestRepay || (repay === soonestRepay && obj.getPrice() < lowestPrice)) {
            soonestRepay = repay;
            best = obj;
            lowestPrice = obj.getPrice();
        }
    }
    return best;
}

function findBest(objects, cookiesPs) {
    let best = findQuickest(objects);
    let bestTimeTo = best.getPrice() / cookiesPs;
    for(let obj in objects) {
        obj = objects[obj];
        if(!obj.available()) continue;
        
        let timeToObj = obj.getPrice() / cookiesPs;
        let timeToBest = best.getPrice() / (cookiesPs + obj.getCps());
        let totalTime = timeToObj + timeToBest;
        if(totalTime < bestTimeTo) {
            best = obj;
            bestTimeTo = timeToObj;
        }
    }
    return best;
}

function showBuy(obj, funding) {
    let txt = "Buying " + obj.getName() +
    " for " + Beautify(obj.getPrice()) +
    " at " + Beautify(obj.getPrice() / obj.getCps()) +
    " cookies per CPS!" + 
    "\n" + funding;
    setSupportText(txt);
}

function buyOptimally(wrappers, cookiesPs, cookieGetter) {
    let bought = 0;
    let optimal = {buy: (x) => {}};
    let funding = "";
    
    do {
        optimal.buy(1);
        optimal = findBest(wrappers, cookiesPs);
        funding = fund(optimal.getPrice() - cookieGetter());
        bought += 1;
    } while(optimal.getPrice() <= cookieGetter() && bought < 50);
    showBuy(optimal, funding);
    
    if(!Game.HasAchiev("Just wrong") && Game.Upgrades["Kitten helpers"].bought) {
        bGrandma.sell(1);
    }
}

function buyBot() {
    buyOptimally(wrappers, Game.cookiesPsRaw, () => Game.cookies);
}

//}
/*===================================================
    UI FUNCTIONS
===================================================*/
//{

const supportComment = $('.supportComment');
supportComment.style.whiteSpace = "pre-line";

function setSupportText(str) {
    supportComment.childNodes[0].textContent = str;
}

function printValueOf(obj) {
    console.info(
    obj.getName() +
    " costs " + Beautify(obj.getPrice()) +
    " and is valued at " + Beautify(obj.getPrice() / obj.getCps()) +
    " cookies per CPS!");
}

function evaluateBuilding(building) {
    printValueOf(wrapBuilding(building.id));
}

function evaluateUpgrade(upgrade) {
    printValueOf(wrapUpgrade(upgrade.name));
}

//}
/*===================================================
    PREPARE LISTS
===================================================*/
//{

function rebuildWrappers() {
    //TODO: Achievemnt Wrappers
    
    wrappers.length = 0;
    for(let b in Game.ObjectsById) {
      let wrapped = wrapBuilding(b);
      if(wrapped) wrappers.push(wrapped);
    }
    for(let u in Game.Upgrades) {
      let wrapped = wrapUpgrade(u);
      if(wrapped) wrappers.push(wrapped);
    }
}

//}
/*===================================================
    SHIMMER LOGIC
===================================================*/
//{

function clickShimmer(shimmer) {
    if(shimmer.type === goldenCookie) {
        if(!Game.HasAchiev("Fading luck") && shimmer.life > 30) return; //Fading Luck Achievement
        shimmer.pop();
    }
}

function clickShimmers() {
    for(let i in Game.shimmers) {
        clickShimmer(Game.shimmers[i]);
    }
}

//}
/*===================================================
    ASSETS
===================================================*/
//{

/* Asset Definition:
 * name -> String:
 *  A descriptive name for the asset.
 * getAmount() -> Number:
 *  Returns the amount of cookies available from this asset.
 * liquidize(demand) -> Number:
 *  Attempts to liquidizes the Asset to satisfy the demand.
 *  Frees assets even when the demand can not be met. Returns how many cookies were freed.
 * available() -> bool:
 *  Returns whether the asset can currently be liquidized.
 * priority() -> Number:
 *  Returns the priority of the asset.
 */
const assets = [];
var stockMarketAdded = false;

function stockMarketLoaded() {
    return bBank.minigameLoaded;
}

function stockMarket() {
    return bBank.minigame;
}

function currentOverhead(brokers) {
    return 1 + 0.01 * (20 * Math.pow(0.95, brokers));
}

function obtainStock() {
    if(!stockMarketLoaded()) return;
    let market = stockMarket();
    
    for(let good in market.goodsById) {
        good = market.goodsById[good];
        if(!good.active) continue;
        
        let price = good.val * currentOverhead(market.brokers);
        if(price < market.getRestingVal(good.id) && good.stock < market.getGoodMaxStock(good)) {
            console.info("Buying " + good.name + " at " + good.val + " each.");
            market.buyGood(good.id, 10000); // Is equal to buy Max.
        }
    }
}

//!!!!!!!!!!!!!!!!!!!COOOOKIESpSrAW ACTUALLY CONTAINS A MULT

function addStockAssets(market, assets){
    for(let good in market.goodsById){
        good = market.goodsById[good];
        
        let asset = {};
        asset.name = "Stock: " + good.name;
        asset.getAmount = function() {
            return good.stock * good.val * Game.cookiesPsRawHighest;
        }
        asset.liquidize = function(demand) {
            let targetSell = Math.ceil(demand / (good.val * Game.cookiesPsRawHighest));
            let actualSell = Math.min(targetSell, good.stock);
            let volume = actualSell * good.val * Game.cookiesPsRawHighest;
            console.info("Selling " + actualSell + " " + asset.name + " at " + good.val + " each");
            market.sellGood(good.id, actualSell);
            return volume;
        }
        asset.available = function() {
            return good.active && good.val > market.getRestingVal(good.id) && good.stock > 0;
        }
        asset.priority = function() {
            return good.val - market.getRestingVal(good.id);
        }
        assets.push(asset);
    }
}

var lastTime = Date.now();

function fund(target) {
    if(target < 0) return;
    if(!stockMarketAdded && stockMarketLoaded()){
        addStockAssets(stockMarket(), assets);
        stockMarketAdded = true;
    }
    
    let hypothetical = target;
    assets.sort((a, b) => b.priority() - a.priority());
    for(let asset in assets) {
        asset = assets[asset];
        if(!asset.available()) continue;
        
        hypothetical -= asset.getAmount();
        if(hypothetical < 0) {
            let prevTarget = target;
            for(let sellAsset in assets) {
                sellAsset = assets[sellAsset];
                if(!sellAsset.available()) continue;
                
                let obtained = sellAsset.liquidize(target);
                target -= obtained;
                console.info("Sold " + asset.name + " for " + obtained);
                console.info("Obtained " + Beautify(prevTarget - target) + "/" + Beautify(prevTarget) + " so far")
                if(target < 0) {
                    return;
                }
            }
        }
    }
    return "Funds are at: " + Beautify(target - hypothetical) + "/" + Beautify(target);
}

function obtainAssets() {
    obtainStock();
}

//}
/*===================================================
    DEBUG FUNCTIONS
===================================================*/
//{

var goldenSpawn;
var marketTick;

function spawnGolden() {
    let newShimmer = new Game.shimmer(goldenCookie);
    newShimmer.spawnLead = 1;
    Game.shimmerTypes[goldenCookie].spawned = 1;
}

function toggleDebugGolden(everyX = 5) {
    if(goldenSpawn) {
        console.info("Stopping golden tick!");
        clearInterval(goldenSpawn);
        goldenSpawn = 0;
    }
    else {
        console.info("Starting golden tick!");
        goldenSpawn = setInterval(spawnGolden, everyX * 1000);
    }
}

function tickMarket() {
    stockMarket().tick();
}

function toggleDebugMarket(everyX = 5) {
    if(!stockMarketLoaded()) {
        console.info("Not starting bot: Markets are not loaded yet!");
        return;
    }
    if(marketTick) {
        console.info("Stopping market tick!");
        clearInterval(marketTick);
        marketTick = 0;
    }
    else {
        console.info("Starting market tick!");
        marketTick = setInterval(tickMarket, everyX * 1000);
    }
}

//}
/*===================================================
    START/STOP LOGIC
===================================================*/
//{

function settings() {
    Game.prefs['fancy'] = false;
    Game.prefs['filters'] = false;
    Game.prefs['particles'] = false;
    Game.prefs['numbers'] = false;
    Game.prefs['milk'] = false;
    Game.prefs['cursors'] = true;
    Game.prefs['wobbly'] = false;
    Game.prefs['cookiesound'] = false;
    Game.prefs['crates'] = false;
    Game.prefs['monospace'] = false;
    Game.prefs['format'] = false;
    Game.prefs['notifs'] = false;
    Game.prefs['warn'] = false;
    Game.prefs['focus'] = true;
    Game.prefs['extraButtons'] = false;
    Game.prefs['askLumps'] = false;
    Game.prefs['customGrandmas'] = false;
    Game.prefs['timeout'] = false;
    Game.volume = 0;
}

var shimmerBot;
var clickerBot;
var accquirementBot;
var marketBot;

function start() {
    settings();
    rebuildWrappers();
    clickerBot = setInterval(click, 1000 / targetClicksPerSecond);
    shimmerBot = setInterval(clickShimmers, 1000 / shimmerClicksPerSecond);
    accquirementBot = setInterval(buyBot, 1000 / buysPerSecond);
    marketBot = setInterval(obtainAssets, 1000 * marketInterval);
}

function stop() {
    clearInterval(shimmerBot);
    clearInterval(clickerBot);
    clearInterval(accquirementBot);
    clearInterval(marketBot);
}

if(autostart) {
    start();
}