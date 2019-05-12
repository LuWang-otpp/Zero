import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'containers/Home';
import { authStatus, setUser } from 'modules/users';
import SignIn from 'containers/SignIn';
import SignUp from 'containers/SignUp';
import PropTypes from 'prop-types';

export default class App extends Component {
  static contextTypes = {
    router: PropTypes.object,
    store: PropTypes.object,
  };

  componentDidMount() {
    const { store, router } = this.context;
    store.dispatch(authStatus()).then(user => {
      if (!user) {
        console.log('No User detected');
      } else {
        store.dispatch(setUser(user));
      }
    });
  }

  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/login" component={SignIn} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="*" component={Home} />
        </Switch>
      </div>
    );
  }
}