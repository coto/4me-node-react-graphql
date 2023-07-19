const {request, response} = require('express')
const csvToJson = require('convert-csv-to-json');
const fileName = "./assets/test.csv"
const config = require('./../config.json')
const {importExcelService} = require('./../services/ImportExcelService')
const { readConfigurationItems, storeConfigurationItems } = require('../services/ConfigurationItemService');

module.exports = {
    Index:async(req = request, res=response) => {
        var response = [];
        if(config.mailimport)
        {
            importExcelService(async function(status, json, message){
                if(status)
                {
                   response = await readConfigurationItems(json)
                }else
                {
                   response = {
                       success: false,
                       message: "Import Excel file Error: "+message 
                   }
                }
                return res.json(response)
            })
        }else
        {
            let json = csvToJson.fieldDelimiter('";"').getJsonFromCsv(fileName);
            response = await readConfigurationItems(json)
            return res.json(response)
        }
        
        
    },

    Store:async(req = request, res=response)=>{
        var response = []
        

        if(config.mailimport)
        {
            
            importExcelService(async function(status, json){
                if(status)
                {
                    response = await storeConfigurationItems(json);
                }
                
                response = {
                    success:false,
                }
                return res.json(response)
            })
        }else
        {
            let json = csvToJson.fieldDelimiter('";"').getJsonFromCsv(fileName);
            response = await storeConfigurationItems(json)
            return res.json(response)
        }

        
    }
}