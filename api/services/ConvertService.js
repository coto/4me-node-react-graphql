exports.convertToServerJson = function convertToServerJson(item, prevRow=null)
{
    var result = {
        name:item["Adresse_Business_Calls"],
        systemID: item["Simkartennummer"],
        label: item["Simkartennummer"] + "r-" + item["Nachname"],
        label: item["Simkartennummer"],
        status: "pending",
        remarks: item["Bemerkungen"] + " "+ "+" + item["Land"] + item["VW"] + item["Nummer"],
        location: item["BEN"],
        product: {name:item["Tarif"]},
        customFields: [{ id:"PUK", value:item["PUK"]},  {id:"Nummer", value:  item["Land"] + item["VW"] + item["Nummer"]}]
    };
    if(prevRow)
    {
        result["id"]  = prevRow["id"]
    }
    
    
    return result;
} 