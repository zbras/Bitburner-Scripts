/** @param {NS} ns */

const file = 'master.js';

export async function main(ns) {

    const sleep_delay = 200;
    var roi_dict = {};
    var servers = [];
    var servers_to_scan = ns.scan('home');
    var purchased_servers = ns.getPurchasedServers();
    var iter = 0;

    purchased_servers.unshift('home');

    while (servers_to_scan.length > 0) {

        var server = servers_to_scan.shift();

        if (!servers.includes(server)) {

            servers.push(server);
            servers_to_scan = servers_to_scan.concat(ns.scan(server));

            if (!ns.hasRootAccess(server)) { continue };
            if (purchased_servers.includes(server)) { continue };

            var money = ns.getServerMoneyAvailable(server);
            var hack_time = ns.getHackTime(server);
            var grow_time = ns.getGrowTime(server);
            var weak_time = ns.getWeakenTime(server);

            var roi = money / ((hack_time + 4 * sleep_delay) + (grow_time - hack_time - 2 * sleep_delay) + (weak_time - grow_time - sleep_delay) + (2 * sleep_delay));
            roi_dict[server] = roi.toFixed(2);

            await file_transfer(server, ns);
        }
    }

    var roi_list = sort_dictionary(roi_dict)

    for (let server of purchased_servers) {

        await ns.scp(file, server);
        ns.killall(server)
        await ns.exec(file, server, 1, roi_list[iter], server);
        iter++;

    }
}

function sort_dictionary(obj) {

    var items = Object.keys(obj).map(function(key) {
        return [key, obj[key]];
    })

    items.sort(function(first, second) {
    return second[1] - first[1];
    });

    var sorted_obj = {};

    items.forEach(function(k, v) {
        var use_key = k[0];
        var use_value = k[1];
        sorted_obj[use_key] = use_value;
    })

    var list = Object.keys(sorted_obj)

    return list;

}

async function file_transfer(server, ns) {

    if (server == 'home') { return }

    await ns.killall(server);
    await ns.scp(file, server);
    await ns.exec(file, server, 1, server);

}