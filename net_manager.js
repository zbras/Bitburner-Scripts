/** @param {NS} ns **/
export async function main(ns, percent = ns.args[0], max_nodes = ns.args[1]) {

    while (true) {
    
        let available_funds = ns.getServerMoneyAvailable('home');
        let allowance = available_funds * (percent / 100);

        if (ns.hacknet.getPurchaseNodeCost() < allowance && ns.hacknet.numNodes() < max_nodes) {

            ns.hacknet.purchaseNode();

            continue;

        }

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {

            let node = ns.hacknet.getNodeStats(i);
            let cur_return = [];
            let max_return = 0;

            if (node.level < 200) {
                cur_return.push(((node.level + 1) * 1.6) * Math.pow(1.035, (node.ram - 1)) * ((node.cores + 5) / 6) / ns.hacknet.getLevelUpgradeCost(i, 1));
            } else {
                cur_return.push(0);
            }

            if (node.ram < 64) {
                cur_return.push((node.level * 1.6) * Math.pow(1.035, (node.ram * 2) - 1) * ((node.cores + 5) / 6) / ns.hacknet.getRamUpgradeCost(i, 1));
            } else {
                cur_return.push(0);
            }

            if (node.cores < 16) {
                cur_return.push((node.level * 1.6) * Math.pow(1.035, node.ram - 1) * ((node.cores + 6) / 6) / ns.hacknet.getCoreUpgradeCost(i, 1));
            } else {
                cur_return.push(0);
            }

            cur_return.forEach(value => {
                if (value > max_return) {
                    max_return = value;
                }
            });

            if (i === max_nodes - 1 && max_return === 0) {
                ns.scriptKill(ns.getScriptName(), ns.getHostname());
            }
            else if (max_return === 0) {
            } else if (max_return == cur_return[0] && ns.hacknet.getLevelUpgradeCost(i, 1) < allowance) {
                ns.hacknet.upgradeLevel(i, 1);
            } else if (max_return == cur_return[1] && ns.hacknet.getRamUpgradeCost(i, 1) < allowance) {
                ns.hacknet.upgradeRam(i, 1);
            } else if (max_return == cur_return[2] && ns.hacknet.getCoreUpgradeCost(i, 1) < allowance) {
                ns.hacknet.upgradeCore(i, 1);
            }

        }

        await ns.sleep(1);

    }
}