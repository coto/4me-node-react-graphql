const config = require('./../config.json')
const gql = require('graphql-request').gql
const GraphQLClient = require('graphql-request').GraphQLClient

const graphQLClient = new GraphQLClient(config.endpoint, {
    headers: {
        "Authorization": config.token,
        "X-4me-Account": config['X-4me-Account'],
        "ContentType": "application/json",
    },
})

const query4meData = async (query,input) => {
     
    try {
        const data = await graphQLClient.request(query, input)
        return {status:true, data:data}
    }catch(error)
    {
        console.log(error.message)
        return {status:false, error:error.message}
    }
}

const query4me = async (query) => {
     
    try {
        const result = await graphQLClient.request(query)
        
        if(result.errors)
        {
            console.log(errors)
            return {status:false, data:result.errors}
        }else
        {
            return {status:true, data:result}
        }
        
    }catch(error)
    {
        console.log(error)
        return {status:false, error:error}
    }
}


exports.getProducts = async function getProducts()
{

}

exports.createProduct = async function createProduct(name, categoryReference) {
    let query = gql`
        mutation productCreateMutation($name:String!, $category:String!){
            productCreate(input:{name:$name, brand:"4me", model:"4me", category:$category})
            {
            product{
                id
                name
            }
            errors{
                path
                message
            }
            }
        }
      `
    let response =  await query4meData(query, {name:name, category:categoryReference})
    let result = response.data
    
    if(!result.productCreate.product)
    {
        let message = "";
        result.productCreate.errors.forEach(function(item, index){
            message += "Product Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
}

exports.filterProductsByName = async function filterProducts(name)
{
   let query = gql`
        query filterProductsByName($name:String!)
        {
            products(first:3, filter:{name:{values:[$name]}})
            {
                totalCount,
                pageInfo {
                 hasNextPage,
                  endCursor
                }
                nodes {
                  id
                  name
                }
            }
        }
    `
   let response = await query4meData(query, {name:name})
   return response;
}

exports.getConfigrationItems = async function getConfigrationItems()
{
    let query = gql`
        query {
            configurationItems(first:100, filter:{status:{values:"in_production"}}) {
                totalCount,
                pageInfo {
                    hasNextPage,
                    endCursor
                }
                nodes {
                    id
                    name
                    systemID
                    label
                    status
                    sourceID
                    remarks
                    location
                    supportTeam{
                        id
                        name
                    }
                    site {
                        id
                        name
                    }
                    customFields{
                        id
                        value
                    }
                    product {
                        id
                        name
                    }
                    
                }
            }
        }
      `;
    
    let result = [];

    let response =  await query4me(query);
    
    
    if(response.status)
    {
        let configurationItems = response.data.configurationItems;
        for(let i = 0; i < configurationItems.nodes.length;i++)
        {
            result.push(configurationItems.nodes[i]);
        }
        
        
        let nextPageStatus = configurationItems.pageInfo.hasNextPage;
        let endCursor = configurationItems.pageInfo.endCursor;
        
        while(nextPageStatus)
        {
            query = gql`
                query getConfigurationItems($first:Int!, $after:String!){
                    configurationItems(first:$first, after:$after, filter:{status:{values:"in_production"}}) {
                        totalCount,
                        pageInfo {
                            hasNextPage,
                            endCursor
                        }
                        nodes {
                            id
                            name
                            systemID
                            label
                            status
                            sourceID
                            supportTeam{
                                id
                                name
                            }
                            site {
                                id
                                name
                            }
                            customFields{
                                id
                                value
                            }
                            product {
                                id
                                name
                            }
                            
                        }
                    }
                }
            `;
            response =  await query4meData(query, {first:100, after:endCursor});
            if(response.status)
            {
                let configurationItems = response.data.configurationItems;
                for(let i = 0; i < configurationItems.nodes.length;i++)
                {
                    result.push(configurationItems.nodes[i]);
                }
                
                nextPageStatus = configurationItems.pageInfo.hasNextPage;
                endCursor = configurationItems.pageInfo.endCursor;
        
            }else
            {
                break;
            }
        }
        
        return {status:true, data:result}

    }else
    {
        return {status:false, data:result}
    }
}

exports.createConfigurationItem  = async function createConfigurationItem(newItem) {
   
    let input = {
        productId:newItem["productId"],
        systemID:newItem["Simkartennummer"],
        label:newItem["Simkartennummer"] + "r-" + newItem["Nachname"],
        name:newItem["Adresse_Business_Calls"],
        serviceId:newItem["serviceId"],
        supportTeamId:newItem["teamId"],
        siteId:newItem["siteId"],
        serviceId:newItem["serviceId"],
        PUK:newItem["PUK"],
        Nummer: newItem["Land"] + newItem["VW"] + newItem["Nummer"],
        phoneNumber:newItem["Bemerkungen"] + " "+ newItem["phoneNumber"] + ", PUK: "+newItem["PUK"],
        location:newItem["BEN"],
        serviceInstanceId: newItem['serviceInstanceId']
    }
    let query = gql`
        mutation ciMutation(
            $productId:ID!, 
            $systemID:String!,
            $name:String!,
            $serviceId:ID!,
            $supportTeamId:ID!,
            $PUK:JSON!,
            $Nummer:JSON!,
            $label:String!,
            $siteId: ID!,
            $phoneNumber: String!,
            $location: String!,
            $serviceInstanceId: ID!,
        ) {
            configurationItemCreate(input: { 
                productId:$productId,
                status: "in_production",
                systemID: $systemID,
                label: $label,
                name:$name,
                serviceId:$serviceId,
                supportTeamId:$supportTeamId,
                siteId:$siteId,
                customFields:[{id:"PUK", value:$PUK}, {id:"Nummer", value:$Nummer}],
                remarks: $phoneNumber,
                location: $location,
                serviceInstanceIds : [$serviceInstanceId]
            })
            {
                configurationItem {
                    id
                    name
                }
                errors {
                    path
                    message
                }
            }
        }
      `
    
    
    let response =  await query4meData(query, input)
    let result = response.data
    
    if(!result.configurationItemCreate.configurationItem)
    {
        let message = "";
        result.configurationItemCreate.errors.forEach(function(item, index){
            message += "Product Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
}

exports.updateConfigurationItem  = async function createConfigurationItem(id, newItem) {
   
    let input = {
        id: id,
        productId:newItem["productId"],
        systemID:newItem["Simkartennummer"],
        label:newItem["Simkartennummer"] + "r-" + newItem["Nachname"],
        name:newItem["Adresse_Business_Calls"],
        serviceId:newItem["serviceId"],
        supportTeamId:newItem["teamId"],
        siteId:newItem["siteId"],
        PUK:newItem["PUK"],
        Nummer: newItem["Land"] + newItem["VW"] + newItem["Nummer"],
        phoneNumber:newItem["Bemerkungen"] + " "+ newItem["phoneNumber"] + ", PUK: "+newItem["PUK"],
        location:newItem["BEN"],
        serviceInstanceId: newItem['serviceInstanceId']
    }
    let query = gql`
        mutation ciMutation(
            $id: ID!
            $productId:ID!, 
            $systemID:String!,
            $name:String!,
            $serviceId:ID!,
            $supportTeamId:ID!,
            $PUK:JSON!,
            $Nummer:JSON!,
            $label:String!,
            $siteId: ID!,
            $phoneNumber: String!,
            $location: String!,
            $serviceInstanceId: ID!,
        ) {
            configurationItemUpdate(input: { 
                id:$id,
                productId:$productId,
                status: "in_production",
                systemID: $systemID,
                label: $label,
                name:$name,
                serviceId:$serviceId,
                supportTeamId:$supportTeamId,
                siteId:$siteId,
                customFields:[{id:"PUK", value:$PUK}, {id:"Nummer", value:$Nummer}],
                remarks: $phoneNumber,
                location: $location,
                serviceInstanceIds : [$serviceInstanceId]
            })
            {
                configurationItem {
                    id
                    name
                }
                errors {
                    path
                    message
                }
            }
        }
      `

    let response =  await query4meData(query, input)
    let result = response.data
    
    if(!result.configurationItemUpdate.configurationItem)
    {
        let message = "";
        result.configurationItemUpdate.errors.forEach(function(item, index){
            message += "Product Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
}


exports.deleteConfigurationItem = async function deleteConfigurationItem(id)
{
    let mutation = gql`mutation configMutation($id:ID!) {
                        configurationItemUpdate(input: { 
                            id:$id
                            status:"removed"
                        }) {
                            errors {
                                path
                                message
                            }
                        }
                    }`

    let response = await query4meData(mutation, {id:id})
    return response;
}



// supportTeam
exports.createSupportTeams = async function createSupportTeams(name)
{
    let mutation = gql`
        mutation teamMutation {
            teamCreate(input: { 
            name:"Windows Server & Workplace"
            }) {
                team {
                    id
                    name
                }
                errors {
                    path
                    message
                }
            }
        }
    `
    let response = await query4meData(mutation, {name:name})
    let result = response.data
    
    if(!result.teamCreate.team)
    {
        let message = "";
        result.teamCreate.errors.forEach(function(item, index){
            message += "Team Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
    
}

exports.filterSupportTeams = async function filterSupportTeams(name)
{

    let query = gql`
        query filterSupportTeams($name:String!)
        {
            teams(first:3, filter:{name:{values:[$name]}})
            {
                totalCount,
                pageInfo {
                 hasNextPage,
                  endCursor
                }
                nodes {
                  id
                  name
                }
            }
        }
    `
   let response = await query4meData(query, {name:name})
   return response;
}



// service
exports.createService = async function createService()
{
    let mutation = gql`
        mutation serviceMutation{
            serviceCreate(input: { 
                name:"Desktop Services - Arbeitsplatz",
                providerId: "YXBhZGVtbzAyLjIxMDcxNTEzMzAzNUA0bWUtZGVtby5jb20vT3JnYW5pemF0aW9uLzUy"
            }) 
            {
                    service {
                        id
                        name
                    }
                    errors {
                        path
                        message
                    }
            }
        }
    `
    
    let response = await query4me(mutation)
    let result = response.data
    
    if(!result.serviceCreate.service)
    {
        let message = "";
        result.serviceCreate.errors.forEach(function(item, index){
            message += "Service Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
}

exports.filterService = async function filterService(name)
{
    let query = gql`
        query filterService($name:String!)
        {
            services(first:3, filter:{name:{values:[$name]}})
            {
                totalCount,
                pageInfo {
                 hasNextPage,
                  endCursor
                }
                nodes {
                  id
                  name
                }
            }
        }
    `
   let response = await query4meData(query, {name:name})
   return response;
}

// site
exports.createSite = async function createSite()
{
    
    let mutation = gql`
        mutation {
            siteCreate(input: { 
                name:"APA-Laimgrubengasse"
            }) 
        {
            site {
                id
                name
            }
            errors {
                path
                message
            }
            }
        }
    `
    let response = await query4meData(mutation, {providerId:config.serviceProvider.id})
    let result = response.data
    
    if(!result.siteCreate.site)
    {
        let message = "";
        result.siteCreate.errors.forEach(function(item, index){
            message += "Site Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
    
}

exports.filterSite = async function filterSite(name)
{
    let query = gql`
        query filterSite($name:String!)
        {
            sites(first:3, filter:{name:{values:[$name]}})
            {
                totalCount,
                pageInfo {
                 hasNextPage,
                  endCursor
                }
                nodes {
                  id
                  name
                }
            }
        }
    `
   let response = await query4meData(query, {name:name})
   return response;
}
// service instance
exports.createServiceInstance = async function createServiceInstance(serviceId)
{
    
    let mutation = gql`
        mutation($name:String!, $serviceId:ID!) {
            serviceInstanceCreate (input: { 
                name:$name
                serviceId: $serviceId
            }
        
            ) {
            serviceInstance {
                id
                name
            }
            errors {
                path
                message
            }
            }
        }
    `
    let response = await query4meData(mutation, {name:config.serviceInstanceName, serviceId:serviceId})
    let result = response.data

    if(!result.serviceInstanceCreate.serviceInstance)
    {
        let message = "";
        result.serviceInstanceCreate.errors.forEach(function(item, index){
            message += "Service Instance Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
    
}

exports.filterServiceInstance = async function filterServiceInstance(name)
{
    let query = gql`
        query filterSite($name:String!)
        {
            serviceInstances(first:3, filter:{name:{values:[$name]}})
            {
                totalCount,
                pageInfo {
                  hasNextPage,
                  endCursor
                }
                nodes {
                  id
                  name
                }
            }
        }
    `
   let response = await query4meData(query, {name:name})

   return response;
}


exports.createProductCategory = async function createProductCategory()
{
    let mutation = gql`mutation($name:String!) {
        productCategoryCreate(
          input:{name:$name, ruleSet:"physical_asset", sourceID:$name}
        )
        {
          productCategory{
                id
                name
                reference
            }
            errors{
                path
                message
            }
          
        }
    }`

    let response = await query4meData(mutation, {name:config.productCategoryName})
    let result = response.data
    if(!result.productCategoryCreate.productCategory)
    {
        let message = "";
        result.productCategoryCreate.errors.forEach(function(item, index){
            message += "Service Instance Create: "+"\n"+item.message + "\n" 
        })
    
        return {
            status:false,
            message: message
        }
    }
    return {
        status:true,
        data:result
    }
    
}


exports.filterProudctCategory = async function filterProductCategory(){
    let query = gql`
        query filterProductCategory($name:String!)
        {
            productCategories(first:3, filter:{sourceID:{values:[$name]}})
            {
                totalCount,
                pageInfo {
                  hasNextPage,
                  endCursor
                }
                nodes {
                  id
                  name
                  reference
                }
            }
        }
    `
   let response = await query4meData(query, {name:config.productCategoryName})

   return response;
}