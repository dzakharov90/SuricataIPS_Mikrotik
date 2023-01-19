require('dotenv').config()
var mt = require('./src/mtconnect/index');
Tail = require('tail').Tail;
tail = new Tail("/var/log/syslog");

const localip = process.env.EXTERNAL_ADDR;
const ipv6addr = new RegExp(process.env.EXTERNAL_V6ADDR_REGEXP, 'gm');
const RuleRegexp = new RegExp(process.env.RULE_MATCH_REGEXP, 'gm');

tail.on("line", data => {
    if (data.match(/[A-Za-z]+ [\d]+ [\d]+\:[\d]+\:[\d]+ [A-Za-z ]+\[[\d]+]\: \[[\d]+\:([\d]+)\:[\d]+\] (.+) ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+ \-\> ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+/gm)) {
        //console.log(data);
        const RuleMatch = /[A-Za-z]+ [\d]+ [\d]+\:[\d]+\:[\d]+ [A-Za-z ]+\[[\d]+]\: \[[\d]+\:([\d]+)\:[\d]+\] (.+) ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+ \-\> ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+/gm.exec(data);
        if (RuleMatch[3] != localip) {
            console.log('Rule SID: ' + RuleMatch[1])
            console.log('Rule : ' + RuleMatch[2])
            console.log('SRC IP: ' + RuleMatch[3])
            if (RuleMatch[2].match(RuleRegexp)) {
                console.log("RULE MATCHED!!!")
                mt.fw_block_ip(RuleMatch[3],RuleMatch[2])
                console.log('IP ' + RuleMatch[3] + ' Banned for ' + RuleMatch[2])
            }
        } else {
            console.log('Rule SID: ' + RuleMatch[1])
            console.log('Rule : ' + RuleMatch[2])
            console.log('DST IP: ' + RuleMatch[4])
            if (RuleMatch[2].match(RuleRegexp)) {
                console.log("RULE MATCHED!!!")
                mt.fw_block_ip(RuleMatch[4],RuleMatch[2])
                console.log('IP ' + RuleMatch[4] + ' Banned for ' + RuleMatch[2])
            }
        }
    } else if (data.match(/[A-Za-z]+ [\d]+ [\d]+\:[\d]+\:[\d]+ [A-Za-z ]+\[[\d]+]\: \[[\d]+\:([\d]+)\:[\d]+\] (.+) ([a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+)\:[\d]+ \-\> ([a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+)\:[\d]+/gm)) {
        const RuleMatch = /[A-Za-z]+ [\d]+ [\d]+\:[\d]+\:[\d]+ [A-Za-z ]+\[[\d]+]\: \[[\d]+\:([\d]+)\:[\d]+\] (.+) ([a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+)\:[\d]+ \-\> ([a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+\:[a-z0-9]+)\:[\d]+/gm.exec(data);
        if(!RuleMatch[3].match(ipv6addr)) {
            console.log('Rule SID: ' + RuleMatch[1])
            console.log('Rule : ' + RuleMatch[2])
            console.log('SRC IP: ' + RuleMatch[3])
            if (RuleMatch[2].match(RuleRegexp)) {
                console.log("RULE MATCHED!!!")
                mt.fw_block_ip6(RuleMatch[3],RuleMatch[2])
                console.log('IP ' + RuleMatch[3] + ' Banned for ' + RuleMatch[2])
            }
        } else {
            console.log('Rule SID: ' + RuleMatch[1])
            console.log('Rule : ' + RuleMatch[2])
            console.log('DST IP: ' + RuleMatch[4])
            if (RuleMatch[2].match(RuleRegexp)) {
                console.log("RULE MATCHED!!!")
                mt.fw_block_ip6(RuleMatch[4],RuleMatch[2])
                console.log('IP ' + RuleMatch[4] + ' Banned for ' + RuleMatch[2])
            }
        }
    }
});
