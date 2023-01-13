# IPS with Mikrotik and Suricata

Lets say you’ve a Mikrotik router as your internet router and you would like to block bad traffic that is going over it, so basically you would like to have an IPS (Intrusion Prevention System)

There is no direct integration between the Mikrotik router and Suricata. I have been looking for a long time how to do this. I found several articles, but I could not implement it. Then I decided that I would try to write an application myself that would look at the log of a meerkat, and by certain SIDs.

Next, I will describe the complete instructions for installing and configuring everything

## Mikrotik setup

* /tool sniffer set filter-stream=yes streaming-enabled=yes streaming-server=xxx.xxx.xxx.xxx
* /tool sniffer start

xxx.xxx.xxx.xxx is the IP of the Linux server

* /ip firewall add action=drop chain=input comment="Block bad actors" src-address-list=Blocked
* /ip firewall add action=drop chain=forward comment="Drop any traffic going to bad actors" dst-address-list=Blocked

Enabling Mikrotik API

* /ip service set api address=yyy.yyy.yyy.yyy/yy enabled=yes

yyy.yyy.yyy.yyy/yy is the subnet of the your local network

## Suricata setup

Next, move on to installing Suricata.

For this, I have allocated a virtual server on Ubuntu 22.04.

For Ubuntu, the OISF maintains a PPA suricata-stable that always contains the latest stable release.

To use it:

* sudo apt-get install software-properties-common
* sudo add-apt-repository ppa:oisf/suricata-stable
* sudo apt-get update
* sudo apt-get install suricata oinkmaster

Now we download the open/free Emerging Threats rules for the first tests. (There are also commercial rules available.)

* cd /etc/suricata/
* wget https://rules.emergingthreatspro.com/open/suricata/emerging.rules.tar.gz
* tar -xzf emerging.rules.tar.gz
* apt-get install -y pip
* pip install pyyaml
* pip install https://github.com/OISF/suricata-update/archive/master.zip
* pip install --pre --upgrade suricata-update

Rule sources update:

* suricata-update update-sources

To view the list of sources, run:

* suricata-update list-sources

Include all free sources:

* suricata-update enable-source ptresearch/attackdetection
* suricata-update enable-source oisf/trafficid
* suricata-update enable-source sslbl/ssl-fp-blacklist

Update the rules:
* suricata-update

Now we need to get traffic from the router

## Trafr

Trafr is an application written by Mikrotik to convert TZSP traffic to pcap. The application is 32-bit, so to run it you will need to enable support for 32-bit applications in 64-bit Ubuntu:

* dpkg --add-architecture i386
* apt-get update && apt-get install -y libc6:i386

Download and unpack trafr:

* wget http://www.mikrotik.com/download/trafr.tgz
* tar xzf trafr.tgz

Check that traffic is being caught:

* ./trafr -s

If you see random flickering on the screen, then traffic arrives, and trafr catches it. If so, we transfer trafr to permanent residence and launch it with the transfer of the caught traffic through the pipeline immediately to Suricata:

* mv trafr /usr/local/bin/
* /usr/local/bin/trafr -s | suricata -c /etc/suricata/suricata.yaml -r /dev/stdin

Now we check that the traffic is coming to Suricata, for this, in the neighboring terminal we execute:

tail -f /var/log/syslog

You should see a smart scroll of meaningful text - a log of receiving traffic by a meerkat.

## Installing app

This is a simple nodeJS application. We need to clone it, configure it and run it.

### [NodeJS installation]

* curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash - &&\
* apt-get install -y nodejs

### [App]

* apt install -y git
* cd /opt
* git clone https://github.com/dzakharov90/SuricataIPS_Mikrotik.git SuricataMikrotikIPS
* cd SuricataMikrotikIPS
* npm install
* mv ./.env.examlpe ./.env

after installation, we need to edit the .env file and enter the correct data there

##### MIKROTIK_ADDR="YYY.YYY.YYY.YYY"
##### MIKROTIK_API_USER="api"
##### MIKROTIK_API_PASS="test123"
##### EXTERNAL_ADDR="ZZZ.ZZZ.ZZZ.ZZZ"
##### FWBLOCK_TIMEOUT="01:00:00" # 1 Hour by default
##### RULES_SIDS="2024793,2035436,2021701"

I provided this information as an example.

##### MICROTIK_ADDR is the local address of the router.
##### MIKROTIK_API_USER - username is specified here.
##### MIKROTIK_API_PASS - user password.
##### EXTERNAL_ADDR - specify the address of the external interface.
##### FWBLOCK_TIMEOUT - blocking time. by default i set 1 hour.
##### RULES_SIDS - a set of SID rules by which the application will tell the router to add it to the block list address.

you can get the SID of the rules in a file 
* /var/lib/suricata/rules/suricata.rules

now we are ready to run our application

run:

* node index.js

that's all :)
