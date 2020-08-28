/*===================================================
    CONFIGURATION
===================================================*/

const autostart = true;
const clicksPerSecond = 10;
const shimmerClicksPerSecond = 1;
const buysPerSecond = 2;

/*===================================================
    EXECUTION CONSTANTS
===================================================*/
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
        return Game.ObjectsById[id].price;
    }
    wrapper.getCps = function(){
        return Game.ObjectsById[id].storedCps;
    }
    wrapper.buy = function(){
        Game.ObjectsById[id].buy();
    }
    wrapper.getName = function(){
        return "Building: " + Game.ObjectsById[id].name;
    }
    wrapper.canBuyAgain = true;
    return wrapper;
}
/*===================================================
    UPGRADE LOGIC
===================================================*/

function getGrandmaCpsGetter(grandma){
    return () => {
        let tieBuilding = grandma.buildingTie; 
        let bTieCps = tieBuilding.storedCps * bGrandma.amount / (tieBuilding.id - 2) ;
        return bGrandma.storedTotalCps + bTieCps;
    };
}

function getCookieCpsGetter(cookie){
    return () => {
        return 0.01 * cookie.power * Game.cookiesPsRaw;
    };
}

function wrapUpgrade(id){
    let u = Game.UpgradesInStore[id];
    let wrapper = {};
    wrapper.getPrice = () => { return u.getPrice(); };
    
    if(u.pool == "cookie"){
        wrapper.getCps = getCookieCpsGetter(u);
    }
    else if(u.name.includes("grandmas")){
        wrapper.getCps = getGrandmaCpsGetter(u);
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
        let repay = obj.getPrice() / obj.getCps();
        if (repay < soonestRepay) {
            soonestRepay = repay;
            best = obj;
        }
    }
    return best;
}

function findBest(objects){
    let quickest = findQuickest(objects);
    return quickest;
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
  let objects = [];
  for(let b in Game.ObjectsById){
      let wrapped = wrapBuilding(b)
      objects.push(wrapped);
  }
  for(let u in Game.UpgradesInStore){
      let wrapped = wrapUpgrade(u)
      if(wrapped) objects.push(wrapped);
  }
  let optimal = findBest(objects);
  //TODO: Buy in a loop if the money is enough.
  optimal.buy();
  showBuy(optimal);
}

/*===================================================
    UI FUNCTIONS
===================================================*/

function setSupportText(str){
    let supportComment = $('.supportComment');
    supportComment.childNodes[0].textContent = str;
}

/*===================================================
    DEBUG FUNCTIONS
===================================================*/

function spawnGolden(){
    let newShimmer = new Game.shimmer(goldenCookie);
    newShimmer.spawnLead = 1;
    Game.shimmerTypes[goldenCookie].spawned = 1;
}

/*===================================================
    INTERVAL LOGIC
===================================================*/

var shimmerBot;
var clickerBot;
var cookieBot;

function start(){
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