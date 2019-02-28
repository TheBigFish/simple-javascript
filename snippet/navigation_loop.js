function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

(async function () {
    console.log('Do some thing, ' + new Date());
    await sleep(1000);
    console.log('Do other things, ' + new Date());
})();

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

let navigation_resolve = null
let navigation_reject = null

function navigation_to(positon) {
    setTimeout(function () {
        navigation_resolve();
    }, (getRandomInt(3) + 3) * 1000);

    console.log("navigation to " + positon + " start");

    return new Promise((resolve, reject) => {
        function my_resolve() {
            //console.log("");
            resolve('done');
        }

        function my_reject() {
            console.log("navigation to " + positon + " canceled by user");
            reject("user canceled!");
        }
        navigation_resolve = my_resolve;
        navigation_reject = my_reject;
    });
}

function can_charge() {
    return true;
}

async function auto_charge() {
    try {
        await navigation_to("charge").then(() => console.log("navigation to charge finish"));
        await navigation_to("dock").then(() => console.log("navigation to dock finish"))
    } catch (err) {
        console.log(err);
    }
}

async function thread_auto_charge() {
    await sleep(1000);
    if (can_charge()) {
        await auto_charge()
    }
}

auto_charge()
setTimeout(function () {
    navigation_reject();
}, 2000);