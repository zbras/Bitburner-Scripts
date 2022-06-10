/** @param {NS} ns **/

// This script will add script income and script xp per second information to the Overview window

export async function main(ns) {

    const doc = document; // 25GB RAM
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');

    while (true) {

        const headers = [];
        const values = [];

        headers.push('SINC');
        values.push(format_large_number(ns.getScriptIncome()[0]) + '/s');
        headers.push('SXP');
        values.push(format_large_number(ns.getScriptExpGain()) + '/s');
        hook0.innerText = headers.join('\n');
        hook1.innerText = values.join('\n');

        await ns.sleep(1000);

    }
}

function format_large_number(number) {

    let abbreviations = ['k','m','b','t','q','Q'];
    var multiplier = 0;

    while (number / 1000 > 1000) {

        number = number / 1000;
        multiplier += 1;

    }

    return (number / 1000).toFixed(2) + abbreviations[multiplier];

}