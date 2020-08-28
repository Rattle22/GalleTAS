/*===================================================
    CONFIGURATION
===================================================*/

const autostart = true;
const clicksPerSecond = 10;
const shimmerClicksPerSecond = 1;
const buysPerSecond = 2;

/*===================================================
    HELPFUL DEFINITIONS
===================================================*/
const wrappers = [];

const goldenCookie = 'golden';
const bGrandma = Game.ObjectsById[1];

/*===================================================
    SHIMMER LOGIC
===================================================*/

function clickShimmer(shimmer) {
    if(shimmer.type === goldenCookie){
        shimmer.pop();
    }
}

function clickShimmers() {
    for(let i in Game.shimmers){
        clickShimmer(Game.shimmers[i]);
    }
}
/*===================================================
    CLICK LOGIC
===================================================*/

function clickCookie(){
    Game.ClickCookie();
}

/*===================================================
    BUILDING LOGIC
===================================================*/
function wrapBuilding(id){
    let b = Game.ObjectsById[id];
    let wrapper = {};
    wrapper.getPrice = function(){
        return b.price;
    }
    wrapper.getCps = function(){
        return b.storedCps;
    }
    wrapper.buy = function(){
        b.buy();
    }
    wrapper.getName = function(){
        return "Building: " + b.name;
    }
    wrapper.available = function() { return true; };
    wrapper.canBuyAgain = true;
    return wrapper;
}
/*===================================================
    UPGRADE LOGIC
===================================================*/

function getCookieCpsGetter(cookie){
    return () => {
        return 0.01 * cookie.power * Game.cookiesPsRaw;
    };
}

function getGrandmaCpsGetter(grandma){
    return () => {
        let tieBuilding = grandma.buildingTie; 
        let bTieCps = tieBuilding.storedCps * bGrandma.amount / (tieBuilding.id - 2) ;
        return bGrandma.storedTotalCps + bTieCps;
    };
}

function getKittenCpsGetter(kitten){
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
    return function(){
      return Game.milkProgress * mult * Game.cookiesPsRaw;  
    };
}

function getMouseCpsGetter(cookie){
    return () => {
        return 0.01 * clicksPerSecond * Game.cookiesPsRaw;
    };
}

function wrapUpgrade(id){
    let u = Game.Upgrades[id];
    let wrapper = {};
    wrapper.getPrice = () => { return u.getPrice(); };
    
    if(u.pool == "cookie"){
        wrapper.getCps = getCookieCpsGetter(u);
    }
    else if(u.name.includes("grandmas")){
        wrapper.getCps = getGrandmaCpsGetter(u);
    }
    else if(u.name.includes("Kitten")){
        wrapper.getCps = getKittenCpsGetter(u);
    }
    else if(u.name.includes("mouse")){
        wrapper.getCps = getMouseCpsGetter(u);
    }
    
    if(!wrapper.getCps){
        wrapper.getCps = () => 0;
    }
    wrapper.buy = () => {
        u.buy();
    }
    wrapper.getName = () => {
        return "Upgrade: " + u.name;
    }
    wrapper.available = function() { return u.unlocked && !u.bought; };
    wrapper.canBuyAgain = false;
    return wrapper;
}

/*===================================================
    BUY LOGIC
===================================================*/

// The quickest is that which pays for itself after the shortest amount of time.
function findQuickest(objects){
    let best;
    let soonestRepay = Number.MAX_VALUE;
    for(obj in objects){
        obj = objects[obj];
        if(!obj.available()) continue;
        
        let repay = obj.getPrice() / obj.getCps();
        if (repay < soonestRepay) {
            soonestRepay = repay;
            best = obj;
        }
    }
    return best;
}

function findBest(objects){
    let best = findQuickest(objects);
    let lowestPrice = best.getPrice();
    for(obj in objects){
        obj = objects[obj];
        if(!obj.available() || obj.getPrice() > lowestPrice) continue;
        
        let timeTo = best.getPrice() - obj.getPrice() / Game.cookiesPsRaw;
        let repayTime = obj.getPrice() / obj.getCps();
        if(repayTime < timeTo){
            best = obj;
            lowestPrice = obj.getPrice();
        }
    }
    return best;
}

function showBuy(obj){
    //previousId;
    //if(id == previousId) return;
    let txt = "Buying " + obj.getName() +
    " for " + Beautify(obj.getPrice()) +
    " at " + Beautify(obj.getPrice() / obj.getCps()) +
    " cookies per CPS!";
    setSupportText(txt);
    //Game.Notify("New Plan!", txt);
}

function buyOptimally() {
  let optimal = findBest(wrappers);
  while(optimal.getPrice() < Game.cookies){
    optimal.buy();
    optimal = findBest(wrappers);
  }
  showBuy(optimal);
}

/*===================================================
    UI FUNCTIONS
===================================================*/

function setSupportText(str){
    let supportComment = $('.supportComment');
    supportComment.childNodes[0].textContent = str;
}

function printValueOf(obj){
    console.info(
    obj.getName() +
    " costs " + Beautify(obj.getPrice()) +
    " and is valued at " + Beautify(obj.getPrice() / obj.getCps()) +
    " cookies per CPS!");
}

/*===================================================
    PREPARE LISTS
===================================================*/

function rebuildWrappers(){
    wrappers.length = 0;
    for(let b in Game.ObjectsById){
      let wrapped = wrapBuilding(b);
      if(wrapped) wrappers.push(wrapped);
    }
    for(let u in Game.Upgrades){
      let wrapped = wrapUpgrade(u);
      if(wrapped) wrappers.push(wrapped);
    }
}

/*===================================================
    DEBUG FUNCTIONS
===================================================*/

function spawnGolden(){
    let newShimmer = new Game.shimmer(goldenCookie);
    newShimmer.spawnLead = 1;
    Game.shimmerTypes[goldenCookie].spawned = 1;
}

function evaluateBuilding(building){
    printValueOf(wrapBuilding(building.id));
}

function evaluateUpgrade(upgrade){
    printValueOf(wrapUpgrade(upgrade.name));
}

/*===================================================
    START/STOP LOGIC
===================================================*/

var shimmerBot;
var clickerBot;
var cookieBot;

function start(){
    rebuildWrappers();
    shimmerBot = setInterval(clickCookie, 1000 / clicksPerSecond);
    clickerBot = setInterval(clickShimmers, 1000 / shimmerClicksPerSecond);
    cookieBot = setInterval(buyOptimally, 1000 / buysPerSecond);
}

function stop(){
    clearInterval(shimmerBot);
    clearInterval(clickerBot);
    clearInterval(cookieBot);
}

if(autostart){
    start();
}