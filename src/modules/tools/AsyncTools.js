import GenericTools from './GenericTools'
const AsyncTools = {

  to(promise) {
    return promise.then(data => {
      return [null, data];
    })
      .catch(err => [err]);
  },



  parseJSON(response) {
    return new Promise((resolve, reject) =>
      response.json()

        .then((json) => resolve({
          status: response.status,
          ok: response.ok,
          json
        }))
        .catch(error => {
          response.status === 204 ? resolve({ ok: response.ok, status: response.status, json: { ok: response.ok } }) : reject(error)
        })
    );
  },


  superFetch(url, payload) {
    if ((GenericTools.isCordova() || GenericTools.isCapacitor()) && process.env.REACT_APP_DOMAIN) {
      url = process.env.REACT_APP_DOMAIN + url;
      let cookies = "kl=" + localStorage.getItem("kl") + "; klo=" + localStorage.getItem("klo") + "; access_token=" + localStorage.getItem("access_token")
      let basicHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': localStorage.getItem("access_token"), 'Cookie': cookies }
      if (payload && payload.headers) payload.headers = { ...basicHeaders, ...payload.headers }
      else if (payload) payload.headers = basicHeaders;
      else { payload = { headers: basicHeaders } }
    }


    let fPromise = payload == null ? fetch(url) : fetch(url, payload);

    return new Promise((resolve, reject) => {
      fPromise
        .then(this.parseJSON)// this trys to parse- get origin error when you have one.
        .then((response) => {
          if (response.ok) {
            return resolve([response.json, null]);
          }
          // extract the error from the server's json
          return resolve([null, response.json]);
        })
        .catch((error) => resolve([null, { error: { message: "No response, check your network connectivity", statusCode: 500, name: "ERROR" } }]));
    });
  }

}

export default AsyncTools;
