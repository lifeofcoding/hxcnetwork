import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';
import eventBus from 'src/lib/event-bus';

export class Sidebar extends React.Component {
  static propTypes = {
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string.isRequired,
      query: React.PropTypes.object.isRequired,
    }),
  };

  state = {
    navItems: [
      {pathname: '/', label: 'Home', icon: 'home'},
      {
        pathname: '/proxies',
        label: 'Proxies',
        icon: 'proxies',
        protected: true,
      },
      {pathname: '/laptop', label: 'Laptop', icon: 'computer', protected: true},
      {
        pathname: '/crack',
        label: 'Crack WPA',
        icon: 'network',
        protected: true,
      },
    ],
    showHistory: false,
    history: [],
    userLoggedIn: false,
  };

  componentWillMount() {
    this.toggleHistory = this.toggleHistory.bind(this);
  }

  isSelected(navItem) {
    return this.props.location.pathname === navItem.pathname ? 'selected' : '';
  }

  componentDidMount() {
    eventBus.on('user:loggedin', user => {
      //this.state.navitems.push({ pathname: '/proxies', label: 'Proxies', icon: 'info' });
      this.setState({
        userLoggedIn: true,
      });
    });

    eventBus.on('player:play', ({title, url}) => {
      this.state.history.push({title, url});
      this.setState({
        history: this.state.history,
      });
    });
  }

  renderLinks() {
    return _.map(this.state.navItems, navItem => {
      if (
        (this.state.userLoggedIn && navItem.protected) ||
        !navItem.protected
      ) {
        return (
          <li
            className={`al-sidebar-list-item ${this.isSelected(navItem)}`}
            key={navItem.pathname}
          >
            <Link
              className="al-sidebar-list-link"
              to={{pathname: navItem.pathname, query: navItem.query}}
            >
              <i className={`fa fa-${navItem.icon}`}></i>
              <span>{navItem.label}</span>
            </Link>
          </li>
        );
      }
    });
  }

  renderHistory() {
    return _.map(this.state.history, (song, idx) => {
      return (
        <li className={`al-sidebar-list-item`} key={idx}>
          <a
            className="al-sidebar-list-link"
            style={{marginLeft: '-100%', textOverflow: 'ellipsis'}}
            href="#"
          >
            <i className={`fa fa-music`}></i>
            <span>{song.title}</span>
          </a>
        </li>
      );
    });
  }

  toggleHistory(e) {
    e.preventDefault();

    this.setState({
      showHistory: !this.state.showHistory,
    });
  }

  render() {
    // navitems selected, with-sub-menu
    // links - hover
    /*
      <ul ng-if="item.subMenu" className="al-sidebar-sublist"
                ng-className="{expanded: item.expanded, 'slide-right': item.slideRight}">
              <li ng-repeat="subitem in item.subMenu" ng-className="{'selected': subitem.selected, 'with-sub-menu': subitem.subMenu}">
                <a ng-mouseenter="hoverItem($event, item)" ng-if="subitem.subMenu" href ng-click="toggleSubMenu($event, subitem);"
                   className="al-sidebar-list-link subitem-submenu-link"><span>{{ subitem.title }}</span>
                  <b className="fa" ng-className="{'fa-angle-up': subitem.expanded, 'fa-angle-down': !subitem.expanded}"
                     ng-if="subitem.subMenu"></b>
                </a>
                <ul ng-if="subitem.subMenu" className="al-sidebar-sublist subitem-submenu-list"
                    ng-className="{expanded: subitem.expanded, 'slide-right': subitem.slideRight}">
                  <li ng-mouseenter="hoverItem($event, item)" ng-repeat="subSubitem in subitem.subMenu" ng-className="{selected: subitem.selected}">
                    <a  ng-mouseenter="hoverItem($event, item)" href="{{ subSubitem.root }}">{{
                      subSubitem.title }}</a>
                  </li>
                </ul>
                <a  ng-mouseenter="hoverItem($event, item)" target="{{subitem.blank ? '_blank' : '_self'}}" ng-if="!subitem.subMenu" href="{{ subitem.root }}">{{ subitem.title}}</a>
              </li>
            </ul>
     */
    /*
    <div className="sidebar-hover-elem" ng-style="{top: hoverElemTop + 'px', height: hoverElemHeight + 'px'}"
             ng-className="{'show-hover-elem': showHoverElem }"></div>
     */

    // ul - slimscroll="{height: '{{menuHeight}}px'}" slimscroll-watch="menuHeight"
    return (
      <aside
        className="al-sidebar"
        ng-swipe-right="menuExpand()"
        ng-swipe-left="menuCollapse()"
        ng-mouseleave="hoverElemTop=selectElemTop"
      >
        <ul className="al-sidebar-list">{this.renderLinks()}</ul>
        <ul
          className={
            'al-sidebar-sublist ' + this.state.showHistory
              ? 'expanded'
              : 'slide-right'
          }
        >
          <li className="with-sub-menu' ">
            <a
              href="#"
              className="al-sidebar-list-link subitem-submenu-link"
              onClick={this.toggleHistory}
            >
              <span>History</span>
            </a>
            <ul
              className={
                'al-sidebar-sublist subitem-submenu-list ' +
                this.state.showHistory
                  ? 'expanded'
                  : 'slide-right'
              }
            >
              {this.renderHistory()}
            </ul>
          </li>
        </ul>
      </aside>
    );
  }
}
