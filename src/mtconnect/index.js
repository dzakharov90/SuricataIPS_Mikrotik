require('dotenv').config()
var MikroNode = require('mikronode-ng2');
var connection = MikroNode.getConnection(process.env.MIKROTIK_ADDR,process.env.MIKROTIK_API_USER,process.env.MIKROTIK_API_PASS);
const conn = connection.connect();
var chan=conn.openChannel();


module.exports.fw_block_ip = function(ip,comment) {
    chan.write(['/ip/firewall/address-list/add',`=address=${ip}`,`=timeout=${process.env.FWBLOCK_TIMEOUT}`,`=comment=${comment}`,'=list=Blocked'])
}

module.exports.fw_block_ip6 = function(ip,comment) {
    chan.write(['/ipv6/firewall/address-list/add',`=address=${ip}`,`=timeout=${process.env.FWBLOCK_TIMEOUT}`,`=comment=${comment}`,'=list=Blocked'])
}
