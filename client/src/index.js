import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import { history } from './components/history';

import Home from './pages/Home';
import SimList from './pages/SimList';
import Success from './pages/Success';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';

ReactDOM.render(

  <BrowserRouter>
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/simlist" exact component={SimList} />
        <Route path="/success" exact component={Success} />
      </Switch>
    </Router>

  </BrowserRouter>,
  document.getElementById("root")
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
