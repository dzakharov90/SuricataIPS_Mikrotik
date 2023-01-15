require('dotenv').config()
var mt = require('./src/mtconnect/index');
Tail = require('tail').Tail;
tail = new Tail("/var/log/syslog");

const localip = process.env.EXTERNAL_ADDR;

tail.on("line", data => {
    if (data.match(/[A-Za-z]+ [\d]+ [\d]+\:[\d]+\:[\d]+ [A-Za-z ]+\[[\d]+]\: \[[\d]+\:([\d]+)\:[\d]+\] (.+) ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+ \-\> ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+/gm)) {
        //console.log(data);
        const RuleMatch = /[A-Za-z]+ [\d]+ [\d]+\:[\d]+\:[\d]+ [A-Za-z ]+\[[\d]+]\: \[[\d]+\:([\d]+)\:[\d]+\] (.+) ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+ \-\> ([\d]+\.[\d]+\.[\d]+\.[\d]+)\:[\d]+/gm.exec(data);
        if (RuleMatch[3] != localip) {
            console.log('Rule SID: ' + RuleMatch[1])
            console.log('Rule : ' + RuleMatch[2])
            console.log('SRC IP: ' + RuleMatch[3])
            if (RuleMatch[2].match(process.env.RULE_MATCH_REGEXP)) {
                mt.fw_block_ip(RuleMatch[3],RuleMatch[2])
                console.log('IP ' + RuleMatch[3] + ' Banned for ' + RuleMatch[2])
            }
        } else {
            console.log('Rule SID: ' + RuleMatch[1])
            console.log('Rule : ' + RuleMatch[2])
            console.log('DST IP: ' + RuleMatch[4])
            if (RuleMatch[2].match(process.env.RULE_MATCH_REGEXP)) {
                mt.fw_block_ip(RuleMatch[4],RuleMatch[2])
                console.log('IP ' + RuleMatch[4] + ' Banned for ' + RuleMatch[2])
            }
        }
    };
});
