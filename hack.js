/** @param {NS} ns **/
export async function main(ns, server = ns.args[0]) {

    var earned = await ns.hack(server);

    //await ns.toast('Earned ' + earned + ' from ' + ns.args[0] + '.', 'success', 5000);

}