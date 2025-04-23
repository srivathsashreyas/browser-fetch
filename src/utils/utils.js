import CDP from 'chrome-remote-interface';


async function returnTargets(domain, port, targetType) {
    //list available targets
    const targets = await CDP.List({ port });
    
    //attach to relevant target 
    const target = targets.find(target => target.url.includes(domain) && target.type === targetType);
    if (!target) {
        throw new Error(`Target for ${domain}, with type ${targetType} not found, remote debugging port ${port}`);
    }

    return target;
}

async function returnDomains(domain, port, targetType) {
    //return relevant target
    const target = await returnTargets(domain, port, targetType);

    //activate target
    CDP.Activate({ port: port, id: target.id });

    //retrieve client(domains)
    const client = await CDP({ port: port, target: target });
    //enable page, network events and disable network cache
    await client.Page.enable();
    await client.Network.enable();
    await client.Network.setCacheDisabled({ cacheDisabled: true });
    
    return client;
}

export { returnTargets, returnDomains };