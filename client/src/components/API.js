
let baseURL = 'http://localhost:5000/api';
// let baseURL = "/api/"
class API {
    static baseURL = baseURL;
   
    static async request(url, method = 'GET', body = null) {
        return  fetch(baseURL + url, {
          method: method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
           
          },
          body: body === null ? null : JSON.stringify(body)
          
        });

        
    }



    static getConfigurationItems()
    {
        return this.request('/configurationItems', "GET")
    }


    static saveConfigurationItems()
    {
        return this.request('/configurationItems/store', "GET")
    }
}

export default API;