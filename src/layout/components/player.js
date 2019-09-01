import React from 'react';
// Lib
import { unescape } from 'lodash';
import eventBus from 'src/lib/event-bus';
import {Row, Col} from 'react-flex-proto';
import styles from './player.scss';

export class Player extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      url: '',
      showTitle: false,
    };

    this._media = null;

    eventBus.on('player:play', ({title, url}) => {
      this.setState({
        url
      }, () => {
        window.player = this.player;
        this.player.setSrc(url);
        this.player.play();
        this.setState({
          title,
          showTitle: false,
        })
      });
    });

    this.setRef = (el) => {
      var _this = this;
      this.player = new MediaElementPlayer(el, {
			  success: function (media) {
          _this._media = media;

				  media.addEventListener('canplay', () => {
              _this.setState({
                  showTitle: true
              })
				  });

			  }
			})
    }
  }

  render() {
    return (
      <div className={styles.playerBar} style={{bottom: this.state.url.length ? '0px' : '-40px', height: '40px'}} scroll-position="scrolled" max-height="50">
        <div className={'animated rubberBand '  + this.state.showTitle ? styles.trackTitle : styles.hide}>{unescape(this.state.title)}</div>
        <audio ref={this.setRef} id="player" className={styles.player} controls src={this.state.url} />
      </div>
    );
  }
}
