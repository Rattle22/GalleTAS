//}
/*===================================================
    CONFIGURATION
===================================================*/
//{
    
/* Rules for this TAS:
 * No more than 17 clicks a second. This is the requirement for uncanny clicker, which is human-reachable, but not sustainable (giving the bot an edge) and does not invalidate most of the game.
 * Heralds are to be set to its highest value of 100 upon starting the game. This prevents this quasi-random non-gameplay-factor to influence the game without making related upgrades useless.
 * Any Action not forbidden by these rules is allowed if there is a combination of key presses/clicks that allow a human player to perform said Action.
    - In particular, this allows buying and selling arbitrary amounts of buildings and stocks within the same action.
 * The run starts as soon as the first cookie is earned.
 */

const autostart = false;
var targetClicksPerSecond = 17;
var shimmerClicksPerSecond = 2; //Should be > 1 for "Fading Luck" Achievement
var buysPerSecond = 2;
var marketInterval = 10; // In seconds.
var gardenInterval = 60; // In seconds.

function clicksPerSecond() {
    if(!Game.HasAchiev("Neverclick") && Game.cookieClicks <= 15) return 0;
    return targetClicksPerSecond ;
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
const bFarm = Game.ObjectsById[2];
const bFactory = Game.ObjectsById[3];
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

function callIfFunction(val, arg) {
    return (typeof(val) === 'function' ? val(arg) : val);
}

function prebuffMult() {
    let noMultCps = Game.cookiesPs / Game.globalCpsMult; // Divide both normal boni and buffs out
	let mult = Game.unbuffedCps / noMultCps; // Only the non buff mult remains
	return isNaN(mult) ? 1 : mult;
}

function withAllBoni(cps) {
    return withShimmerBonus(withClickingBonus(cps));
}

//}
/*===================================================
    CLICK LOGIC
===================================================*/
//{
  
var leftSideOldHeight = Game.LeftBackground.canvas.height;
var gotClickBasedAchievements = false;

function click() {
    if(gotClickBasedAchievements) {
      Game.ClickCookie()
      return;
    }
    
    if(!Game.HasAchiev("Neverclick") && Game.cookieClicks < 15) {
        Game.ClickCookie();
    } else if(Game.cookieClicks === 15 && buildings[0].amount == 0) {
      buildings[0].buy()
    } else if(!Game.HasAchiev("Tabloid addiction")) {
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
        $("#oldenDays").children[0].click();
    } else if(!Game.HasAchiev("Cookie-dunker") && Game.LeftBackground.canvas.height === leftSideOldHeight) {
      Game.LeftBackground.canvas.height = 1;
    } else if(Game.cookieClicks > 15 || Game.HasAchiev("Neverclick")) {
        Game.ClickCookie();
        gotClickBasedAchievements = true;
    }
    
    if(Game.HasAchiev("Cookie-dunker") && Game.LeftBackground.canvas.height === 1) {
      Game.LeftBackground.canvas.height = leftSideOldHeight;
    }
}
        
function withClickingBonus(cps) {
    let bonus = mouses.reduce((total, mouse) => total + mouse.bought, 0);
    return cps * (1 + 0.01 * bonus * clicksPerSecond());
}

function rawCookiesPerClick() {
    var add = 0;
    if (Game.Has('Thousand fingers')) add += 0.1;
    if (Game.Has('Million fingers')) add += 0.5;
    if (Game.Has('Billion fingers')) add += 5;
    if (Game.Has('Trillion fingers')) add += 50;
    if (Game.Has('Quadrillion fingers')) add += 500;
    if (Game.Has('Quintillion fingers')) add += 5000;
    if (Game.Has('Sextillion fingers')) add += 50000;
    if (Game.Has('Septillion fingers')) add += 500000;
    if (Game.Has('Octillion fingers')) add += 5000000;
    if (Game.Has('Nonillion fingers')) add += 50000000;
    var num = 0;
    for (var i in Game.Objects) {
        num += Game.Objects[i].amount;
    }
    num -= Game.Objects['Cursor'].amount;
    add = add * num;
    if (Game.Has('Plastic mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Iron mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Titanium mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Adamantium mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Unobtainium mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Eludium mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Wishalloy mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Fantasteel mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Nevercrack mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Armythril mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Technobsidian mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Plasmarble mouse')) add += Game.cookiesPs * 0.01;
    if (Game.Has('Miraculite mouse')) add += Game.cookiesPs * 0.01;

    if (Game.Has('Fortune #104')) add += Game.cookiesPs * 0.01;
    var mult = 1;

    if (Game.Has('Santa\'s helpers')) mult *= 1.1;
    if (Game.Has('Cookie egg')) mult *= 1.1;
    if (Game.Has('Halo gloves')) mult *= 1.1;
    if (Game.Has('Dragon claw')) mult *= 1.03;

    mult *= Game.eff('click');

    if (Game.hasGod) {
        var godLvl = Game.hasGod('labor');
        if (godLvl == 1) mult *= 1.15;
        else if (godLvl == 2) mult *= 1.1;
        else if (godLvl == 3) mult *= 1.05;
    }

    //if (Game.hasAura('Dragon Cursor')) mult*=1.05;
    mult *= 1 + Game.auraMult('Dragon Cursor') * 0.05;
    
    var out = mult * Game.ComputeCps(1, Game.Has('Reinforced index finger') + Game.Has('Carpal tunnel prevention cream') + Game.Has('Ambidextrous'), add);

    return out;
}

//}
/*===================================================
    UPGRADE LOGIC
===================================================*/
//{

function isCookie(up) {
    return up.pool === "cookie" && up.id !== 473; //"Green yeast digestives" are cookies only nam- wait no.
}

function getCookieCpsGetter(cookie) {
    var bonus = 0;
    if(cookie.name === "Elderwort biscuits") bonus = bGrandma.storedTotalCps * 0.02 * (1 + 0.01 * cookie.power);
    return () => {
        let cookiePowerBonus = 0.01 * Game.cookiesPsRaw * callIfFunction(cookie.power, cookie);
        return withAllBoni(cookiePowerBonus + bonus);
    };
}

function isGrandma(up) {
    return up.name.includes("grandmas");
}

function getGrandmaCpsGetter(grandma) {
    return () => {
        let tieBuilding = grandma.buildingTie;
        let bTieCps = tieBuilding.storedCps * 0.01 * bGrandma.amount / (tieBuilding.id - 1);
        return withAllBoni(bGrandma.storedTotalCps + bTieCps) * prebuffMult();
    };
}

function isKitten(up) {
    return up.name.includes("Kitten");
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
      return withAllBoni(Game.milkProgress * mult * Game.cookiesPsRaw);  
    };
}

function isMouse(up) {
    return up.name.includes("mouse");
}

function getMouseCpsGetter(cookie) {
    return () => {
        return withShimmerBonus(0.01 * clicksPerSecond() * Game.cookiesPsRaw);
    };
}

function fingerPower(finger) {
    return 0.05 * Math.pow(10, finger.tier - 4) + (finger.tier === 4 ? 0.05 : 0);
}

function isFinger(up) {
    return up.name.includes(" fingers"); //Space to exclude Ladyfingers
}

function getFingersCpsGetter(finger) {
    return () => {
        let bonus = fingerPower(finger);
        let buildingCount = buildings.reduce((total, building) => total + building.amount, 0);
        buildingCount -= bCursor.amount;
        return withAllBoni(buildingCount * bonus * bCursor.amount) * prebuffMult() + buildingCount * bonus * clicksPerSecond();
    };
}

function isHeavenly(up) {
	return up.id >= 129 && up.id < 133;
}

function getHeavenlyCpsGetter(heavenly) {
	let bonus = (mult) => {
		return () => {
			return withAllBoni(Game.cookiesPsRaw * mult * Game.prestige * 0.01);
		};
	}
	if(heavenly.id == 129) return bonus(0.05);
	if(heavenly.id == 130) return bonus(0.2);
	return bonus(0.25);
}

function isSimple(up) {
    return up.desc.includes(" are <b>twice</b> as efficient.") || up.desc.includes(" are twice as productive.");
}

function getSimpleUpgradeCpsGetter(simple) {
    if(simple.id <= 2) { //The first three upgrades have no building tie...
        return () => {
            let cursorCps = bCursor.storedTotalCps;
            let buildingBonus = (withAllBoni(cursorCps) * 2 - cursorCps) * prebuffMult();
            
            let mouseCpsBonus = Game.cookiesPsRaw * 0.01 * mouses.reduce((total, mouse) => total + mouse.bought, 0);
            let clickingBonus = withShimmerBonus((Game.computedMouseCps - mouseCpsBonus) * clicksPerSecond());
            
            return clickingBonus + buildingBonus; //...and improve clicks...
        }
    } else if(simple.buildingTie === 0) { //...except for ritual rolling pins.
        return () => { 
            return withAllBoni(bGrandma.storedTotalCps) * prebuffMult();
        };
    }
    return () => {
        return withAllBoni(simple.buildingTie.storedTotalCps) * prebuffMult();
    };
}

function isEgg(egg) {
     return egg.id >= 210 && egg.id < 230;
}

function getEggCpsGetter(egg) {
     if(egg.id >= 210 && egg.id < 222) {
           return () => {
                return withAllBoni(Game.cookiesPsRaw * 0.01);
           }
     }
     if(egg.id == 223 || egg.id == 224 || egg.id == 227) { //Chocolate Egg, Wrinkler egg and Farberge Egg aren't worth CPS.
           return () => {
                return 0;
           }
     }
     if(egg.id == 225) {
           return () => {
                let currCps = Game.cookiesPsRaw * prebuffMult();
                return (withClickingBonus(currCps) - currCps) * 0.1 * clicksPerSecond();
           }
     }
     if(egg.id == 226) {
           return () => {
                return Number.MAX_VALUE;
           }
     }
     if(egg.id == 228) {
           return () => {
                let day = Math.floor((Date.now() - Game.startDate) / 1000 / 10) * 10 / 60 / 60 / 24;
                day = Math.min(day, 100);
                let mult = 1 + (1 - Math.pow(1 - day/100, 3)) * 0.1;
                return mult * Game.cookiesPsRaw;
           }
     }
     if(egg.id == 229) {
           return () => {
                return withAllBoni(9); //"egg"
           }
     }
     if(egg.id == 222) {
         return () => {
             return estimateGcUpgradeBoost(1 / 0.95, 0, 0);
         }
     }
     return undefined;
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
    
    if(isCookie(u)) {
        wrapper.getCps = getCookieCpsGetter(u);
    }
    else if(isGrandma(u)) {
        wrapper.getCps = getGrandmaCpsGetter(u);
    }
    else if(isKitten(u)) {
        wrapper.getCps = getKittenCpsGetter(u);
    }
    else if(isMouse(u)) {
        wrapper.getCps = getMouseCpsGetter(u);
    }
    else if(isFinger(u)) {
        wrapper.getCps = getFingersCpsGetter(u);
    }
    else if(isSimple(u)) { // Must come after grandma upgrade check due to isSimple implementation.
        wrapper.getCps = getSimpleUpgradeCpsGetter(u);
    }
    else if(isHeavenly(u)) {
        wrapper.getCps = getHeavenlyCpsGetter(u);
    }
    else if(isEgg(u)) {
        wrapper.getCps = getEggCpsGetter(u);
        if(u.id == 224) wrapper.getPrice = () => {
            let wrinklerWorth = Game.wrinklers.reduce((prev, wrinkler) => wrinkler.sucked + prev, 0);
            return u.getPrice() - wrinklerWorth * 0.05;
        }; else if(u.id == 223) wrapper.getPrice = () => {
            return u.getPrice() - withAllBoni(Game.cookiesPsRaw * 0.01); //Farberge Egg might as well boost CPS by 1%, so it's worth it        
        };
        if(!wrapper.getCps) return;
    } else return;
    
    wrapper.available = function() { return u.unlocked && !u.bought && (Game.UpgradesOwned > 0 || Game.HasAchiev("Hardcore")); };
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
        return withAllBoni(b.cps(b) + fingersBonus()) * prebuffMult();
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

var nextCostEffective;
var totalCostEffectiveTimeToBuy;

var nextBuy;
var totalTimeToBuy;
var remainingTimeToBuy;
var timeSave;
var fundingForNextBuy;

// The costEffective is that which pays for itself after the shortest amount of time.
function findCostEffective(objects) {
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
    let costEffective = findCostEffective(objects);
    let best = costEffective;
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
            
    nextCostEffective = costEffective;
    totalCostEffectiveTimeToBuy = costEffective.getPrice() / cookiesPs;
    
    nextBuy = best;
    timeToBuy = best.getPrice() / cookiesPs;
    remainingTimeToBuy = (best.getPrice() - Game.cookies) / cookiesPs;
    timeSave = totalCostEffectiveTimeToBuy - (costEffective.getPrice() / (cookiesPs + best.getCps()));
    return best;
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
    fundingForNextBuy = funding;
    
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

var originalUpdateMenu = Game.UpdateMenu;

//Courtesy of https://stackoverflow.com/a/11486026
function fancyTimeFormat(duration) {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

function priceLine(price) {
    line = document.createElement("div");
    line.classList.add("price");
    line.classList.add("plain");
    line.append(Beautify(price));
    return line;
}

function buildStatLine(title, text) {
    line = document.createElement("div");
    line.classList.add("listing");
    formattedTitle = document.createElement("b");
    formattedTitle.append(title);
    line.append(formattedTitle);
    line.append(" ");
    line.append(text);
    return line;
}

function addNewSection(currentSection, title) {
    newSection = document.createElement("div");
    newSection.classList.add("subsection");
  
    currentSection.parentNode.insertBefore(newSection, currentSection.nextSibling);
  
    if(title) {
        sectionTitle = document.createElement("div");
        sectionTitle.classList.add("title");
        sectionTitle.style.position = "relative";
        sectionTitle.append(title);
        newSection.appendChild(sectionTitle);
    }
  
    return newSection;
}

function addBotStatsToMenu() {
    section = addNewSection($('#menu .section'), "CookieBot Status");
    
    if(nextBuy === nextCostEffective) {
      section.appendChild(buildStatLine("Current cost effective buy:", nextCostEffective.getName()));
      section.appendChild(buildStatLine("For:", priceLine(nextCostEffective.getPrice())));
      section.appendChild(buildStatLine("Total time to buy:", fancyTimeFormat(totalCostEffectiveTimeToBuy)));
      section.appendChild(buildStatLine("Remaining time to buy:", fancyTimeFormat(remainingTimeToBuy)));
      section.appendChild(buildStatLine("Effectiveness:", Beautify(nextCostEffective.getPrice() / nextCostEffective.getCps()) + " C/CpS"));
    } else {
      section.appendChild(buildStatLine("Current most efficient buy:", nextCostEffective.getName()));
      section.appendChild(buildStatLine("For:", priceLine(nextCostEffective.getPrice())));
      section.appendChild(buildStatLine("Total time to buy:", fancyTimeFormat(totalCostEffectiveTimeToBuy)));
      section.appendChild(buildStatLine("Effectiveness:", Beautify(nextCostEffective.getPrice() / nextCostEffective.getCps()) + " C/CpS"));
      section = addNewSection(section);
      section.appendChild(buildStatLine("Next intermediary objective:", nextBuy.getName()));
      section.appendChild(buildStatLine("For:", priceLine(nextBuy.getPrice())));
      section.appendChild(buildStatLine("Total time to buy:", fancyTimeFormat(totalTimeToBuy)));
      section.appendChild(buildStatLine("Remaining time to buy:", fancyTimeFormat(remainingTimeToBuy)));
      section.appendChild(buildStatLine("Timesave:", fancyTimeFormat(timeSave)));
      section.appendChild(buildStatLine("Effectiveness:", Beautify(nextBuy.getPrice() / nextBuy.getCps()) + " C/CpS"));
    }
}

function updateMenuOverride() {
    originalUpdateMenu();
    if (Game.onMenu=='stats') {
        addBotStatsToMenu();
    }
}

function injectBotStats() {
    Game.UpdateMenu = updateMenuOverride;
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

function gcFrequencyBoost() {
    let m = 1;
    if (Game.Has('Lucky day')) m *= 2;
    if (Game.Has('Serendipity')) m *= 2;
    if (Game.Has('Golden goose egg')) m /= 0.95;
    if (Game.Has('Heavenly luck')) m /= 0.95;
    if (Game.Has('Green yeast digestives')) m /= 0.99;
    //if (Game.hasAura('Arcane Aura')) m/=0.95;
    m /= 1 - Game.auraMult('Arcane Aura') * 0.05;
    if (Game.hasBuff('Sugar blessing')) m /= 0.9;
    if (Game.season == 'easter' && Game.Has('Starspawn')) m /= 0.98;
    else if (Game.season == 'halloween' && Game.Has('Starterror')) m /= 0.98;
    else if (Game.season == 'valentines' && Game.Has('Starlove')) m /= 0.98;
    else if (Game.season == 'fools' && Game.Has('Startrade')) m /= 0.95;
    if (Game.hasGod) {
        var godLvl = Game.hasGod('industry');
        if (godLvl == 1) m /= 1.1;
        else if (godLvl == 2) m /= 1.06;
        else if (godLvl == 3) m /= 1.03;
        var godLvl = Game.hasGod('mother');
        if (godLvl == 1) m /= 1.15;
        else if (godLvl == 2) m /= 1.1;
        else if (godLvl == 3) m /= 1.05;

        if (Game.season != '') {
            var godLvl = Game.hasGod('seasons');
            if (Game.season != 'fools') {
                if (godLvl == 1) m /= 0.97;
                else if (godLvl == 2) m /= 0.98;
                else if (godLvl == 3) m /= 0.99;
            } else {
                if (godLvl == 1) m /= 0.955;
                else if (godLvl == 2) m /= 0.97;
                else if (godLvl == 3) m /= 0.985;
            }
        }
    }
    return m;
}

function gcGainBoost() {
    return 1;
}

function gcTimeBoost() {
    return 1;
}

function estimateShimmerGain(cps, frequencyBoost, gainBoost, timeBoost) {
    return cps * frequencyBoost * (1 + gainBoost);
}

function estimateGcUpgradeBoost(frequencyBoost, gainBoost, timeBoost) {
    return estimateShimmerGain(Game.cookiesPsRaw * prebuffMult() + Game.computedMouseCps, frequencyBoost, gainBoost, timeBoost);
}

function withShimmerBonus(cps) {
    return cps + estimateShimmerGain(cps, gcFrequencyBoost(), gcGainBoost(), gcTimeBoost());
}

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
    GARDEN
===================================================*/
//{

function harvestNearDead() {
    var minigame = Game.Objects["Farm"].minigame;
    if(!minigame) return;
    for (var y=0;y<6;y++) {
        for (var x=0;x<6;x++) {
            let tile = minigame.plot[y][x];
            let plant = minigame.plantsById[tile[0] - 1];
            if(!plant) continue;
            let age = tile[1];
            if(age + plant.ageTick + plant.ageTickR > 100) {
            minigame.harvest(x,y);
            }
        }
    }
}

function manageGarden() {
    harvestNearDead();
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

function saveProgress() {
    text = Game.WriteSave(1);
    date = new Date();
    dateString = date.getDate() + " "
                + (date.getMonth()+1)  + " "
                + date.getFullYear() + " "
                + date.getHours() + " "
                + date.getMinutes() + " "
                + date.getSeconds();
    filename = 'ratbakery-' + dateString + '.cookiesave'

    var blob = new Blob([text], {type: 'text'}),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['cookiesave', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
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

var bots = {};

function start() {
    injectWipe();
    settings();
    rebuildWrappers();
    injectBotStats();
    bots["clickerBot"] = setInterval(click, 1000 / targetClicksPerSecond);
    bots["shimmerBot"] = setInterval(clickShimmers, 1000 / shimmerClicksPerSecond);
    bots["accquirementBot"] = setInterval(buyBot, 1000 / buysPerSecond);
    bots["marketBot"] = setInterval(obtainAssets, 1000 * marketInterval);
    bots["gardenBot"] = setInterval(manageGarden, 1000 * gardenInterval);
}

function stop() {
    gotClickBasedAchievements = false;
    for(let bot in bots) {
        clearInterval(bots[bot]);
    }
    bots = {};
}

var originalWipe = Game.HardReset;

function restartOnWipeInject(bypass) {
  if(bypass && bypass != 1) {
    stop();
  }
  originalWipe(bypass);
  if(bypass && bypass != 1) {
    start();
  }
}

function injectWipe() {
  Game.HardReset = restartOnWipeInject;
}

if(autostart) {
    start();
}