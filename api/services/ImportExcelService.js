const config = require('./../config.json')
const imaps = require('imap-simple');
const csvToJson = require('convert-csv-to-json');
exports.importExcelService = async function importExcelService(callback)
{
    imaps.connect(config.imapconfiguration).then(function (connection) {

        connection.openBox('INBOX').then(function () {
    //         var searchCriteria = ['UNSEEN'];

            var searchCriteria = ['ALL'];
            var fetchOptions = { bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true };

            // retrieve only the headers of the messages
            return connection.search(searchCriteria, fetchOptions);
        }).then(function (messages) {

            var attachments = [];

            messages.forEach(function (message) {
                var parts = imaps.getParts(message.attributes.struct);
                //console.log('PARTS', parts);
                attachments = attachments.concat(parts.filter(function (part) {
                    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                }).map(function (part) {
                    // retrieve the attachments only of the messages with attachments
                    return connection.getPartData(message, part)
                        .then(function (partData) {

                                return {
                                    filename: part.disposition.params.filename,
                                    data: partData
                                };

                        });
                }));
            });

            return Promise.all(attachments);
        }).then(function (attachments) {
            console.log('attachments', attachments);


            var objects = [];
            var headers = [];


            attachments.forEach( attachment => {

                var fileName = attachment.filename;

                // check if attachment is csv file
                if ( fileName.match(new RegExp(/.+(\.csv)$/)) ) {

                    console.log('attachment data string', attachment.data.toString());

                    /*
                    Convert csv to objects. TODO refactor this, this is a useful library function.
                    */
                    let json = csvToJson.fieldDelimiter('";"').csvStringToJson(attachment.data.toString());
                    
                    json.forEach(function (row, index) {
                        var length = Object.keys(row).length 
                        
                        var newRow = []
                        if(length>0)
                        {
                            for(let i = 0; i < length; i++)
                            {  
                                var firstKey = Object.keys(row)[i]
                                var value = row[firstKey].replace("\"", "").trim();
                                var firstKey = firstKey.replace("\"", "").trim();
                                newRow[firstKey] = value
                            }
                            
                            let existingRow = objects.filter(x=>x["Simkartennummer"]== newRow["Simkartennummer"])
                            
                            if(existingRow.length == 0)
                            objects.push(newRow);
                        }
                    });

                }

            });
            

            return  callback(true, objects)

        });

    }).catch(err=>{
        return  callback(false, [], err.message)
    });

}