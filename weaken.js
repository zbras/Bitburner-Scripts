/** @param {NS} ns **/
export async function main(ns, server = ns.args[0]) {

    await ns.weaken(server);

}