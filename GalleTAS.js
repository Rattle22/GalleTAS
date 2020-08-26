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

/*===================================================
    SHIMMER LOGIC
===================================================*/

function clickShimmer(shimmer) {
    if(shimmer.type === goldenCookie){
        shimmer.pop();
    }
}

function clickShimmers() {
    for(var i in Game.shimmers){
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
function optimalBuildingId() {
    cpc = Number.MAX_VALUE;
    var x = 0;
    for(i = Game.ObjectsById.length-1; i >= 0; i--){
        var me = Game.ObjectsById[i];
        var cpc2 = me.price * (Game.cookiesPs + me.storedCps) / me.storedCps; //this addition will make items with worse cost/CpS be bought first if buying them will earn you the cookies needed for better items faster; proven optimal cookie-buying strategy.
        if (cpc2 < cpc) {
            cpc = cpc2;
            x = i;
        }
    }

    return x;
}
/*===================================================
    UPGRADE LOGIC
===================================================*/
/*===================================================
    BUY LOGIC
===================================================*/

var previousId;

function showBuy(id){
    if(id == previousId) return;
    previousId = id;

    var txt = "Buying " + Game.ObjectsById[id].name +
    " for " + Beautify(Game.ObjectsById[id].price) +
    " at " + Beautify(Game.ObjectsById[id].price / Game.ObjectsById[id].storedCps) +
    " cookies per CPS!";
    Game.TickerAge = 1000000;
    Game.Ticker = txt;
    Game.TickerDraw();
}

function buyOptimally() {
  var optimalId = optimalBuildingId();
  Game.ObjectsById[optimalId].buy();
  showBuy(optimalId);
}

/*===================================================
    DEBUG FUNCTIONS
===================================================*/

function spawnGolden(){
    var newShimmer = new Game.shimmer(goldenCookie);
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