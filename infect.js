/** @param {NS} ns */

export async function main(ns) {

    while (true) {

        const curr_hacking_level = ns.getHackingLevel();
        var servers = [];
        var servers_to_scan = ns.scan('home');

        while (servers_to_scan.length > 0) {

            var server = servers_to_scan.shift();

            if (!servers.includes(server)) {

                servers.push(server);
                servers_to_scan = servers_to_scan.concat(ns.scan(server));

                if (!ns.hasRootAccess(server)) {

                    if (server == 'home') { continue }
                    if (ns.getServerRequiredHackingLevel(server) > curr_hacking_level) { continue };
                    //if (ns.getServerMaxMoney(server) == 0) { continue };

                    var open_ports = 0;
                    var num_req = ns.getServerNumPortsRequired(server);

                    try {

                        ns.brutessh(server);
                        ns.ftpcrack(server);
                        ns.relaysmtp(server);
                        ns.httpworm(server);
                        ns.sqlinject(server);

                    } catch {
                        
                        //pass

                    }
                    try {

                        ns.nuke(server);
                        //ns.installBackdoor(server)

                    } catch {

                        //pass

                    }

                }
            }
        }

        await ns.sleep(1000 * 60);

    }
}