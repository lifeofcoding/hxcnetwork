import EventEmitter from 'events';
import _ from 'lodash';

class EventBus extends EventEmitter {

  // this.emit('message', payload) if available by default

  addNotification(type, text, options) {
    const props = _.extend(options, {
      type,
    });

    this.emit('notification', {text, props});
  }

  search(terms) {

  	this.emit('search', terms);
  }

  playSong({title, url}) {
    this.emit('player:play', {title, url});
    this.addNotification('info', _.unescape(title), {title: 'Now Playing'});
  }

  getArtistInfo(terms) {
  	this.emit('getArtist', terms);
  }

  userInit(user) {
    this._user = user;
    this.emit('user:loggedin', user);
    this.addNotification('success', 'You have loggedin successfully!');
  }
}

const eventBus = new EventBus();
export default eventBus;
