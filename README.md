shellsquid
==========

Reverse proxy and web service for managing shells

Shellsquid was built out of necessity. Corporate egress controls often limit outbound connections to http (tcp/80) and https (tcp/443); often requiring the traffic to exit through a proxy. When attacking victims it is then is a neccessity to use reverse payloads that connect on one of these two ports and are proxy aware. The safest option being https. This is straight forward. Start your listener and go.

But what if you're attacking multiple targets and want to keep them separate? What if you're working with a team who is all attacking different targets and they can't share a listener? What are you to do? Shellsquid is meant to alleaviate this issue by dynamically routing your reverse connections to a configured listener on a different port and/or machine.

Shellsquid consists of two seperate services. The first is a dynamic https proxy. The second is a restul web api for managing connection configuration.

Metasploit is the primary supported listener, however other payloads should work.

###Overview###
By this poorly drawn overview you can see that the three victims each call back to the same perimeter listener. They are then proxied to the destination listener on an internal network. The connection is proxied for the entire session.
![overview](https://dl.dropbox.com/u/9743105/Shellsquidoverview.png)

Shellsquid was built to work with payloads that download shellcode over the network. In order to know where to forward a new session a call must be made to the perimeter listenter at '/dl/\<id\>' (eg. https://externaladdress/dl/55445). This call does two things. First it looks up the shelllcode for the specfied id and returns it to the caller. Second, it registers the remote ip with the datastore so shellsquid knows where to send the shell once the previously downloaded shellcode has been executed.

You can also use a domain name to route payloads, this will bypass the remote ip process entirely.

You don't have to follow this workflow or use this type of payload, just makes sure your payload calls '/dl/\<id\>' at some point to register the remote ip.

###Typical Workflow###
1. Start https meterpreter listener on any host
2. Create a new target using the web application
3. Generate your payload, including the call to https://externalip/dl/\<id\>
4. Send payload to victim
5. Victim executes payload
6. Payload calls https://externalip/dl/\<id\> and retrieves shellcode
7. Shellcode is executed and launches meterpreter shell
8. Proxy sends shell to internal host

###Quick Start###
Install Node
  * Shellsquid uses node.js as web platform. Installation of node is extremely easy. Head over to http://nodejs.org/ for more details.

Install Mongodb
  * Mongodb is used for storage. Installation is very simple. Head over to http://www.mongodb.org/ for more details.

Shellsquid Startup

1. Start the mongodb

2. Install dependencies

        cd shellsquid
        npm install

3. Configure shellsquid by modifying the config.json file. This is self explanatory

4. Start proxy and express service

        node app

5. Copy the contents of msf/handler to $MSFROOT/lib/msf/core/handler and msf/stager to $MSFROOT/modules/payloads/stagers/windows. You can now use proxy_https as a handler.

###Dashboard###
Use the web app to configure targets
![dashboard](https://dl.dropbox.com/u/9743105/dashboard.png)
