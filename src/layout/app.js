import React from 'react';
import { withRouter } from 'react-router';

// Components
import { Sidebar, PageTop, Player } from 'src/layout/components';
import { Notifications } from 'src/notifications.js';

// Lib
import eventBus from 'src/lib/event-bus';

class AppLayout extends React.Component {
  static propTypes = {
    router: React.PropTypes.object.isRequired,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
      query: React.PropTypes.object.isRequired,
    }),
  }

  state = {
    search: null,
    idToken: null, // Token indicating user is logged in
    user: null, // Full user for that logged in user, if exists
  }

  componentWillMount() {
    if (process.env.AUTH0_PUB_KEY) {
      this.lock = new Auth0Lock(process.env.AUTH0_PUB_KEY, process.env.AUTH0_DOMAIN);
      this.setState({idToken: this.getIdToken()}); // Must come after this.lock init
    }

    eventBus.on('logout', () => this.onLogout());
    eventBus.on('search', (terms) => this.search(terms));
  }

  componentDidMount() {
    if (! this.state.idToken && process.env.AUTH0_PUB_KEY) {
      return this.redirectToLogin();
    }
    return this.setUser();
  }

  search(terms) {
  	this.setState({
  	  search: terms
  	})
  }

  onLogout() {
    localStorage.removeItem('userToken');
    this.setState({ idToken: null, user: null });
    return this.redirectToLogin();
  }

  redirectToLogin() {
    this.props.router.push({
      pathname: '/login',
      query: { redirectUri: encodeURIComponent(this.props.location.pathname) },
    });
  }

  setUser() {
    if (! this.state.idToken) {
      return null;
    }

    return this.lock.getProfile(this.state.idToken, (err, user) => {
      return err ? this.onLogout() : this.setState({user});
    });
  }

  getIdToken() {
    let idToken = localStorage.getItem('userToken');
    const authHash = this.lock.parseHash(window.location.hash);
    if (!idToken && authHash) {
      if (authHash.id_token) {
        idToken = authHash.id_token;
        localStorage.setItem('userToken', authHash.id_token);
      }
      if (authHash.error) {
        return this.onLogout();
      }
    }
    return idToken;
  }

  render() {
    return (
      <div>
        <main className=''>
          <Sidebar  {...this.props} />
          <PageTop location={this.props.location} history={this.props.history} user={this.state.user} />

          <div className="al-main">
            <div className="al-content">
              {React.cloneElement(this.props.children, _.assign({}, this.props, { user: this.state.user }))}
            </div>
          </div>


          <Player/>
          <footer className="al-footer clearfix">
            <div className="al-footer-right">Created with <i className="ion-heart"></i> by LifeOfCoding (LifeOfCoding@gmail.com)</div>
          </footer>

          <back-top></back-top>
        </main>
        <Notifications />
      </div>
    );
  }
}

export default withRouter(AppLayout);

