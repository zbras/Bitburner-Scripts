/** @param {NS} ns **/

// Oh yes

export async function main(ns) {

    var target_server = ns.args[0];
    var origin_server = target_server; // For deployed server - hack itself
    var hack_js = 'hack.js';
    var grow_js = 'grow.js';
    var weak_js = 'weaken.js';
    var grow_js_ram = ns.getScriptRam(grow_js); // Worker scripts are all the same size, only one variable needed for calculation
    var target_max_money = ns.getServerMaxMoney(target_server);
    var target_max_ram;
    var target_money;
    var target_secur;
    var hack_threads;
    var weak_threads_1;
    var weak_threads_2;
    var grow_threads;
    var available_threads;
    var money_threshold = target_max_money * 0.9; // 0.9 to aquire the largest amount of money without fully depleting server available funds
    var secur_threshold = ns.getServerMinSecurityLevel(target_server) + 5; // Threshold that we want the server to be returned to after each iter
    var max_hack_factor = 0.01;
    var grow_vs_weaken = 0.9; // 9:1 ratio of weakening vs growing server
    var sleep_hack, sleep_grow, sleep_weak, sleep_delay = 200; // Delay between instances as per the documentation for batch processing

    // Second argument not required
    if (ns.args[1]) {
        origin_server = ns.args[1];
    }

    target_max_ram = ns.getServerMaxRam(origin_server);

    // Copy worker files to deployed server if not present
    if (!ns.fileExists(hack_js, origin_server)) {
        await ns.scp(hack_js, 'home', origin_server);
    }
    if (!ns.fileExists(grow_js, origin_server)) {
        await ns.scp(grow_js, 'home', origin_server);
    }
    if (!ns.fileExists(weak_js, origin_server)) {
        await ns.scp(weak_js, 'home', origin_server);
    }

    // Allow worker scripts to complete after program restart
    while (ns.isRunning(hack_js, origin_server, target_server) || ns.isRunning(grow_js, origin_server, target_server) || ns.isRunning(weak_js, origin_server, target_server)) {
        await ns.sleep(10000);
    }

    /*    Main loop   */

    // Run main loop if available RAM is at least 3 times the worker script size
    while (3 < (available_threads = Math.floor((target_max_ram - ns.getServerUsedRam(origin_server)) / grow_js_ram))) {
        target_money = ns.getServerMoneyAvailable(target_server);
        target_secur = ns.getServerSecurityLevel(target_server);

        if (target_secur > secur_threshold && target_money < money_threshold) { // Condition to check and prepare a new-ish server
            sleep_weak = ns.getWeakenTime(target_server) + sleep_delay; // Increase the script delay period to prevent any issues with overlapping scripts
            ns.exec(grow_js, origin_server, Math.ceil(available_threads / 2), target_server);
            ns.exec(weak_js, origin_server, Math.floor(available_threads / 2), target_server);
            await ns.sleep(sleep_weak);
        } else if (target_money < money_threshold) { // Condition to prepare a server which has been grown to the correct available funds threshold
            sleep_weak = ns.getWeakenTime(target_server) + sleep_delay;
            ns.exec(grow_js, origin_server, Math.floor(available_threads * grow_vs_weaken), target_server);
            ns.exec(weak_js, origin_server, Math.ceil(available_threads * (1 - grow_vs_weaken)), target_server);
            await ns.sleep(sleep_weak);
        } else {
            // Condition to hack a prepared server - what the fuck?
            while (
                max_hack_factor <= 0.999 &&
                Math.floor((available_threads - (hack_threads = Math.floor(ns.hackAnalyzeThreads(target_server, target_money * max_hack_factor))) - Math.ceil(hack_threads / 25)) * grow_vs_weaken) > Math.ceil(ns.growthAnalyze(target_server, target_max_money / (target_max_money * (1 - max_hack_factor))))
                ) {
                max_hack_factor += 0.001;
            }
            hack_threads = Math.floor(ns.hackAnalyzeThreads(target_server, target_money * max_hack_factor));
            weak_threads_1 = Math.ceil(hack_threads / 25); // Ratio to weaken a server from one hacking instance is 25:1 hacking vs weakening
            grow_threads = Math.floor((available_threads - weak_threads_1 - hack_threads) * grow_vs_weaken);
            weak_threads_2 = available_threads - hack_threads - grow_threads - weak_threads_1;
            sleep_hack = ns.getHackTime(target_server);
            sleep_grow = ns.getGrowTime(target_server);
            sleep_weak = ns.getWeakenTime(target_server);
            ns.exec(weak_js, origin_server, weak_threads_1, target_server, '1');
            await ns.sleep(2 * sleep_delay);
            ns.exec(weak_js, origin_server, weak_threads_2, target_server, '2'); // Second weaken script runs after the first
            await ns.sleep(sleep_weak - sleep_grow - sleep_delay);
            ns.exec(grow_js, origin_server, grow_threads, target_server); // Grow script ends before second weaken script
            await ns.sleep(sleep_grow - sleep_hack - 2 * sleep_delay);
            ns.exec(hack_js, origin_server, hack_threads, target_server); // Hack script ends before first weaken script
            await ns.sleep(sleep_hack + 4 * sleep_delay); // Loop restarts after all scripts have completed
            max_hack_factor = 0.01;
        }
    }
    ns.tprint('Script was terminated. Not enough RAM available on \'' + origin_server + '\'.')
}