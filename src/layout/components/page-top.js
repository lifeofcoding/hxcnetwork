import React from "react";
import { Link } from "react-router";
import moment from "moment";
import { noop } from "lodash";
import Person from "react-blur-admin/dist/assets/img/person.svg";

import { SearchBar } from "src/layout/components/search-bar";

import { LoginBtn } from 'src/components/loginBtn.js';

import styles from "./page-top.scss";

// Lib
import {
  MessagesAlert,
  MessagesAlertContainer,
  NotificationsAlert,
  NotificationAlert
} from "react-blur-admin";
import { Row, Col } from "react-flex-proto";
import eventBus from "src/lib/event-bus";

export class PageTop extends React.Component {
  static propTypes = {
    user: React.PropTypes.object,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
      query: React.PropTypes.object.isRequired
    })
  };

  constructor(props) {
    super(props);
    this.state = {
      notifications: [],
      messages: [],
      userLoggedIn: false
    };

    this.renderUserSection = this.renderUserSection.bind(this);

    eventBus.on('user:loggedin', (user) => {
      this.setState({
        user,
        userLoggedIn: true
      })
    })
  }

  state = {
    isMenuOpen: false,
    appName: process.env.APP_NAME
  };

  componentWillMount() {}

  onToggleMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen });
  }

  onLogout() {
    eventBus.emit("logout");
    gapi.auth2.getAuthInstance().signOut();
  }

  renderLogo() {
    return (
      <Link to={{ pathname: "/" }} className="al-logo clearfix">
        {this.state.appName}
      </Link>
    );
  }

  renderHamburgerMenu() {
    return null;

    // @todo
    // return (
    //   <a href className="collapse-menu-link ion-navicon" ng-click="isMenuCollapsed=!isMenuCollapsed"></a>
    // );
  }

  renderSearch() {
    return (
      <div className="search" style={{ width: "40vw" }}>
        <SearchBar history={this.props.history}/>
      </div>
    );
  }

  renderMessages() {
    let message = _.assign({}, this.state.messages);
    return _.map(message, (messages, index) => {
      return <MessagesAlert {...messages} key={index} />;
    });
  }

  renderNotifications() {
    let notifications = _.assign({}, this.state.notifications);
    return _.map(notifications, (notification, index) => {
      return <NotificationAlert {...notification} key={index} />;
    });
  }


  renderUserSection() {
		 if (this.state.userLoggedIn) {
				return (
					<div className="user-profile clearfix">
						<div
							className={`al-user-profile dropdown ${
							  this.state.isMenuOpen ? "open" : ""
							}`}
						>
							<a
							  className="profile-toggle-link dropdown-toggle"
							  onClick={this.onToggleMenu.bind(this)}
							>
							  <img src={this.state.user.profileObj.imageUrl} height="45px" style={{borderRadius:'50%'}}/>
							</a>
							<ul className="top-dropdown-menu profile-dropdown dropdown-menu">
							  <li>
							    <i className="dropdown-arr" />
							  </li>
							  <li>
							    <a
							      href={this.props.location.pathname}
							      className="signout"
							      onClick={e => this.onLogout()}
							    >
							      <i className="fa fa-power-off" />Sign out
							    </a>
							  </li>
							</ul>
						</div>
						<Row>
							<Col padding="5px 2px">
							  <MessagesAlertContainer
							    mailCount={this.state.messages.length}
							    markAllAsReadOnClick={noop}
							    allMessagesOnClick={noop}
							    settingsOnClick={noop}
							  >
							    {this.renderMessages()}
							  </MessagesAlertContainer>
							  <NotificationsAlert
							    notificationCount={this.state.notifications.length}
							    markAllAsReadOnClick={noop}
							    allNotificationsOnClick={noop}
							    settingsOnClick={noop}
							  >
							    {this.renderNotifications()}
							  </NotificationsAlert>
							</Col>
						</Row>
					</div>
				);
			} else {
				return (<LoginBtn />)
	 	  }
  }

  render() {
    return (
      <div className="page-top clearfix" scroll-position="scrolled" max-height="50">
        {this.renderLogo()}
        {this.renderHamburgerMenu()}
        {this.renderSearch()}
				{this.renderUserSection()}
      </div>
    );
  }
}
