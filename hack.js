/** @param {NS} ns **/

// This script will be copied to all servers which meet the following criteria:
//      Rooted
//      MaxMoney > 0
//      AvailableRAM > 0
// There is no need to manually copy this script to infected servers

export async function main(ns, server = ns.args[0]) {

    var earned = await ns.hack(server);

    //await ns.toast('Earned ' + earned + ' from ' + ns.args[0] + '.', 'success', 5000);

}