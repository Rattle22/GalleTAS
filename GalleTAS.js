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
const goldenCookie = Game.shimmerTypes['golden'];

/*===================================================
    SHIMMER LOGIC
===================================================*/

function clickShimmer(shimmer) {
    if(shimmer.type === goldenCookie){
        shimmer.pop()
    }
}

function clickShimmers() {
    Game.shimmers.forEach(clickShimmer);
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
    " for " + Math.round(Game.ObjectsById[id].price) +
    " at " + Math.round(Game.ObjectsById[id].price / Game.ObjectsById[id].storedCps) +
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
    INTERVAL LOGIC
===================================================*/

var shimmerBot;
var clickerBot;
var cookieBot;

function start(){
    shimmerBot = setInterval(clickShimmers, 1000 / clicksPerSecond);
    clickerBot = setInterval(clickCookie, 1000 / shimmerClicksPerSecond);
    cookieBot = setInterval(buyOptimally, 1000 / buysPerSecond);
}

function stop(){
    stopInterval(shimmerBot);
    stopInterval(clickerBot);
    stopInterval(cookieBot);
}

if(autostart){
    start();
}