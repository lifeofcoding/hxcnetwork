import React from 'react';
import axios from 'axios';
import { isEmpty } from 'lodash';
import styles from './artist-info.scss';
import eventBus from '../lib/event-bus';

export class ArtistInfo extends React.Component {
  constructor(props) {
    super();

    this.state = {
      opacity: 1,
      loaded: false,
      artist: {}
    }

    eventBus.on('getArtist', (terms) => {
      this.getInfo(terms);
    })

    this.onClickRelated = this.onClickRelated.bind(this);

    var _this = this;
    document.onscroll = () => {
      _this.setState({
        opacity: 1 - (window.scrollY / 350)
      });
    }
  }

  getInfo(terms) {
    if (!this.isLoading) {
      this.isLoading = true;
      axios.get('/api/spotify/search/' + encodeURIComponent(terms))
      .then((response) => {

        // handle success
        console.log(response);
        this.state.artist = {
            name: response.data.body.name,
            image: response.data.body.images[0].url,
            genres: response.data.body.genres.join(', '),
            listeners: response.data.body.followers.total,
            related: response.data.related
          };
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .then(() => {
        this.isLoading = false;
        this.setState({
          artist: this.state.artist
        })
      })
    }
  }

  onClickRelated(e) {
    e.preventDefault();
    this.props.history.push('/search/' + e.target.title)
  }

  renderRelated(related) {
    if (!related) return null;

    var loaded = 0, images = 0;
    var onLoad = () => {
      ++loaded;

      if (loaded === images) {
          this.setState({
            loaded: true
          })
      }
    };

    return (
      related.map((a, idx) => {
        if (idx < 10) {
          let image = (a.images && a.images.length) ? a.images[a.images.length - 1].url : null;

          if (!image) return null;

          ++images;
          return (
            <img key={idx} onLoad={onLoad} onClick={this.onClickRelated} src={image} title={a.name} className={styles.related} />
          )
        }
      })
    )
  }

  render() {
    const {artist} = this.state;

    return (
      <div className="flex-container">
        <div className={isEmpty(artist) ? 'hide' : styles.wrapper} style={{opacity: this.state.opacity}}>
          <div className={'animated vanishIn ' + styles.flexContainer} style={{visibility: this.state.loaded ? 'visible' : 'hidden'}}>
          <div><img src={artist.image} width="280px" height="auto" /></div>
          <div>
            <h3>{artist.name}</h3>i
            <p><b>Genres:</b> {artist.genres}</p>
            <p><b>Listeners:</b> {artist.listeners}</p>
            <div><b>Related Artists:</b> <p>{this.renderRelated(artist.related)}</p></div>
          </div>
          </div>
          <img src={artist.image} className={styles.background} />
        </div>
      </div>
    )
  }
}
