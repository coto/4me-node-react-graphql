const {
    createProduct, 
    updateConfigurationItem,
    createConfigurationItem,
    getConfigrationItems,
    filterProductsByName,
    deleteConfigurationItem,
    createSupportTeams,
    filterSupportTeams,
    filterService,
    createService,
    filterSite,
    createSite,
    filterServiceInstance,
    createServiceInstance,
    filterProudctCategory,
    createProductCategory
 } = require('./../services/GraphService')
 
const {
    changeValidation
} = require('./../services/ValidationService');

const { convertToServerJson } = require('../services/ConvertService');

const config = require('./../config.json')

exports.readConfigurationItems = async function readConfigurationItems(json)
{
    let prevConfigurationItemsResponse = await getConfigrationItems()
    let createCount = 0;
    let updateCount = 0;
    let deleteCount = 0;
    
    if(!prevConfigurationItemsResponse.status)
    {
        return "Error Exception.";
    }
    var prevConfigurationItems = prevConfigurationItemsResponse.data
    var listData = [];
    var simRowList = [];
    var duplicateSimcardNumberList = "";
    
    // Check Duplicate Entry.
    for(let i=0; i<json.length;i++){
        let existingRow = simRowList.filter(x=>x["Simkartennummer"]== json[i]["Simkartennummer"])
        if(existingRow.length > 0)
        {
            duplicateSimcardNumberList += json[i]["Simkartennummer"] + " ";
        }else
        {
            simRowList.push(json[i]);    
        }
        
    }
    
    if(duplicateSimcardNumberList != "")
    {
        return {
            success:false,
            message: "Duplicated Entry: " + duplicateSimcardNumberList
        }
    }

    for(let i=0; i<json.length;i++){
        var row = json[i]
        var length = Object.keys(row).length 
        var newRow = []
        for(let i = 0; i < length; i++)
        {  
            var firstKey = Object.keys(row)[i]
            var value = row[firstKey].replace("\"", "").trim();
            var firstKey = firstKey.replace("\"", "").trim();
            newRow[firstKey] = value
        }
        let simCardNumber = newRow["Simkartennummer"]
        let existingRow = prevConfigurationItems.filter(x=>x.systemID == simCardNumber)

        if(existingRow.length == 0)
        {
            createCount++;
            console.log("Increase create Count"+createCount)

            var createRow = convertToServerJson(newRow)
            
            createRow["mark"] = "Create"
            listData.push(createRow)
        }else
        {
            let prevRow = existingRow[0]
            let changeStatus = changeValidation(prevRow, newRow)
            console.log("Change Status: "+changeStatus)
            for(let j = 0; j < prevConfigurationItems.length; j++)
            {
                if(prevConfigurationItems[j]["systemID"] == simCardNumber)
                {
                    prevConfigurationItems.splice(j,1)
                    break;
                }
            }


            if(changeStatus == true)
            {
                updateCount++;
                let updateRow = convertToServerJson(newRow, prevRow)
                updateRow["mark"] = "update"
                listData.push(updateRow)
                console.log("Increase Update Count"+updateCount)
            }else
            {
                let noneRow = convertToServerJson(newRow, prevRow)
                console.log(noneRow)
                noneRow["mark"] = "none"
                listData.push(noneRow)
            }
        
        }
    }
    
    deleteCount = prevConfigurationItems.length
    for(let j = 0; j < deleteCount; j++ )
    {

        prevConfigurationItems[j]["mark"] = "delete"
        listData.push(prevConfigurationItems[j])
    }

    return {
        success:true,
        data:listData, 
        createCount:createCount, 
        updateCount:updateCount, 
        deleteCount:deleteCount
    }
}

exports.storeConfigurationItems = async function storeConfigurationItems(json)
{
    let prevConfigurationItemsResponse = await getConfigrationItems()
    let createCount = 0;
    let updateCount = 0;
    let deleteCount = 0;
    
    if(!prevConfigurationItemsResponse.status)
    {
        return "Error Exception."
    }
    var prevConfigurationItems = prevConfigurationItemsResponse.data
    let prevTotalCount = prevConfigurationItems.length
    console.log("prevTotal Count Length:" + prevTotalCount)

    for(let i=0; i<json.length;i++){
        let teamId = ""
        let serviceId = ""
        let siteId = ""
        let productId = ""
        let serviceInstanceId = ""
        let categoryReference = ""
        let updateStatus = false
        
        var row = json[i]
        var length = Object.keys(row).length 
        var newRow = []
        
        for(let i = 0; i < length; i++)
        {  
            var firstKey = Object.keys(row)[i]
            var value = row[firstKey].replace("\"", "").trim();
            var firstKey = firstKey.replace("\"", "").trim();
            newRow[firstKey] = value
        }
        let simCardNumber = newRow["Simkartennummer"]
        let existingRow = prevConfigurationItems.filter(x=>x.systemID == simCardNumber)
    
        if(existingRow.length == 0)
        {
            createCount++;
        
            console.log("Increase create Count"+createCount)
            updateStatus = true;
        }else
        {
            let prevRow = existingRow[0]
            let changeStatus = changeValidation(prevRow, newRow)
            console.log("Change Status: "+changeStatus)
            for(let j = 0; j < prevConfigurationItems.length; j++)
            {
                if(prevConfigurationItems[j]["systemID"] == simCardNumber)
                {
                    
                    prevConfigurationItems.splice(j,1)
                    break;
                }
            }
            if(changeStatus == true)
            {
                updateCount++;
                updateStatus = true;
                console.log("Increase Update Count"+updateCount)
            }else
            {
            
                updateStatus = false;
            }
        
        }
        console.log("update status")
        console.log(updateStatus)
        if(updateStatus == true)
        {

            //Product Category
            let productCategoryResponse = await filterProudctCategory()
            
            if(productCategoryResponse.status==true)
            {
                productCategories = productCategoryResponse.data.productCategories
                if(productCategories.totalCount == 0)
                {
                    productCategory = await createProductCategory()
                    
                    if(productCategory.status)
                    categoryReference = productCategory.data.productCategoryCreate.productCategory.reference
                    else
                        return {success:false, message:productCategory.message}
                }else
                {
                    categoryReference = productCategories.nodes[0].reference
                }
            }else
            {
                continue;
            }
            let productName = newRow["Tarif"]
            let productResponse = await filterProductsByName(productName)
            
            // product
            if(productResponse.status==true)
            {
                products = productResponse.data.products
                if(products.totalCount == 0)
                {
                    product = await createProduct(productName, categoryReference)
                    
                    if(product.status)
                        productId = product.data.productCreate.product.id
                    else
                        return {success:false, message:product.message}
                }else
                {
                    productId = products.nodes[0].id
                }
            }else
            {
                continue
            }
            newRow['productId'] = productId;
            // SupportTeam
            let teamResponse = await filterSupportTeams(config.teamName)
            
            if(teamResponse.status==true)
            {
                teams = teamResponse.data.teams
                if(teams.totalCount == 0)
                {
                    team = await createSupportTeams(config.teamName)
                    if(team.status)
                        teamId = team.data.teamCreate.team.id
                    else
                        return {success:false, message:team.message}
                   
                }else
                {
                    teamId = teams.nodes[0].id
                }
            }else
            {
                continue
            }

            newRow['teamId'] = teamId;

            // service
            let serviceResponse = await filterService(config.serviceName)
            
            if(serviceResponse.status==true)
            {
                let services = serviceResponse.data.services
                
                if(services.totalCount == 0)
                {
                    service = await createService()
                    if(service.status)
                        serviceId = service.data.serviceCreate.service.id
                    else
                        return {success:false, message:service.message}
                   
                    
                }else
                {
                    serviceId = services.nodes[0].id
                }
            }else
            {
                continue
            }
            newRow['serviceId'] = serviceId;
            
            // site
            let siteResponse = await filterSite(config.siteName)
        
            if(siteResponse.status==true)
            {
                
                sites = siteResponse.data.sites
                if(sites.totalCount == 0)
                {
                    site = await createSite()
                    if(site.status)
                        siteId = site.data.siteCreate.site.id
                    else
                        return {success:false, message:site.message}
                    
                }else
                {
                    siteId = sites.nodes[0].id
                }
            }else
            {
                continue
            }
            newRow['siteId'] = siteId;

            //service instance
            let serviceInstanceResponse = await filterServiceInstance(config.serviceInstanceName)
            if(serviceInstanceResponse.status==true)
            {
            
                serviceInstances = serviceInstanceResponse.data.serviceInstances
                if(serviceInstances.totalCount == 0)
                {
                    serviceInstance = await createServiceInstance(serviceId)
                    if(serviceInstance.status)
                        serviceInstanceId = serviceInstance.data.serviceInstanceCreate.serviceInstance.id
                    else
                        return {success:false, message:serviceInstance.message}
                   
                }else
                {
                    serviceInstanceId = serviceInstances.nodes[0].id
                }
            }else
            {
                continue
            }
            
            newRow['serviceInstanceId'] = serviceInstanceId;
            newRow['phoneNumber'] = "+"+newRow["Land"] + newRow["VW"] + newRow["Nummer"]
            if(existingRow.length != 0)
            {
                var response = await updateConfigurationItem(existingRow[0].id,newRow)
                if(!response.status)
                    return {success:false, message:response.message}
            }else
            {
                var response = await createConfigurationItem(newRow)
                if(!response.status)
                    return {success:false, message:response.message}
            }
            
            
            
            console.log("Product Created: "+ newRow["Simkartennummer"])

            
        }
        
    }
    

    
    for(let i = 0; i < prevConfigurationItems.length; i++)
    {
        deleteCount++
        let deleteRow = await deleteConfigurationItem(prevConfigurationItems[i].id)
    
    
    }
    
    console.log("Delete Count:"+deleteCount)
    console.log("Create Count:"+createCount)
    console.log("Update Count:"+updateCount)

    return {
        success:true,
        createCount:createCount, 
        updateCount:updateCount, 
        deleteCount:deleteCount
    }
}