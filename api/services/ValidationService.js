exports.changeValidation = function changeValidation(prevRow, newRow){
    
    let result = false
    if(prevRow["name"] != newRow["Adresse_Business_Calls"])
    {
        result = true
        console.log("name:"+ result)
    }

   


    if(prevRow["label"] != newRow["Simkartennummer"] + "r-" + newRow["Nachname"])
    {
        result = true
        console.log("label:"+ result)
    }
    var pukStatus = true

    for(let i = 0; i < prevRow["customFields"].length; i++)
    {
        // console.log(prevRow["customFields"][i]["id"])
        // console.log(prevRow["customFields"][i]["value"])
        // console.log("--------------------")
        // console.log(newRow["PUK"])
        
        if(prevRow["customFields"][i]["id"] == "PUK"&&prevRow["customFields"][i]["value"] == newRow["PUK"])
        {
            pukStatus = false
        }
    }
    result = pukStatus
    if(result)
    {
        return result
    }
    console.log("PUK: ",result)
    var nummerStatus = true 
    for(let i = 0; i < prevRow["customFields"].length; i++)
    {

        
        if(prevRow["customFields"][i]["id"] == "Nummer"&&prevRow["customFields"][i]["value"] == newRow["Land"] + newRow["VW"] + newRow["Nummer"])
        {
            nummerStatus = false
        }
    }
    if(result)
    {
        return result
    }
    result = nummerStatus
    console.log("nummer: ",result)
   
    if(prevRow["product"]["name"] != newRow["Tarif"])
    {
        result = true
        console.log("Tarif:"+ result)
    }

    if(prevRow["remarks"] != newRow["Bemerkungen"] + " "+ "+" + newRow["Land"] + newRow["VW"] + newRow["Nummer"])
    {
        result = true
        console.log("remarks:"+ result)
    }

    if(prevRow["location"] != newRow["BEN"])
    {
        result = true
        console.log("location:"+ result)
    }
    console.log("****************   Result ************************")
    console.log(result)

    return result
}