import React from 'react';
import ReactDOM from 'react-dom';
import {
  Page,
  Panel,
  Table,
  Modal,
  TableHead,
  TableBody,
  TableRow,
  Button,
  EditableText,
  Pagination,
  Breadcrumbs,
} from 'react-blur-admin';
import {Row, Col} from 'react-flex-proto';
import axios from 'axios';
import {Loading} from '../components/loading.js';
import {ArtistInfo} from '../components/artist-info.js';
import {Result} from '../components/result-item.js';
import eventBus from '../lib/event-bus';
import styles from './scss/home.scss';
import {unescape, random} from 'lodash';

const decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities(str) {
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

export class Home extends React.Component {
  constructor(props) {
    super();

    this.state = {
      loaded: false,
      results: [],
      page: 1,
      modal: {
        title: '',
        videoId: '',
        show: false,
      },
      loading: true,
    };

    this.timer = null;
    this.download = this.download.bind(this);
    this.downloadVideo = this.downloadVideo.bind(this);
    this.getResults = this.getResults.bind(this);

    this.el = null;
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.params !== prevProps.params) {
      this.getResults(this.props.params.terms);
    }
  }

  getResults(terms) {
    this.setState({
      loading: true,
    });

    axios
      .get('/api/search/' + encodeURIComponent(terms))
      .then(response => {
        // handle success
        console.log(response);
        this.setState({
          results: response.data,
        });
      })
      .catch(error => {
        // handle error
        console.log(error);
      })
      .then(() => {
        // always executed
        setTimeout(() => {
          this.setState({
            loading: false,
          });

          if (this.props.params.terms) {
            eventBus.getArtistInfo(this.props.params.terms);
          }
        }, 3000);
      });
  }

  millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  componentWillMount() {
    let genres = ['indie', 'rock', 'hiphop', 'folk', 'alternative'];

    let {params} = this.props;
    this.getResults(params.terms || genres[random(0, genres.length)]);
  }

  download(result) {
    this.setState({
      modal: {
        show: true,
        title: result.artist + ' - ' + result.title,
        videoId: result.youtubeId,
        image: result.coverUrl,
        album: result.album,
      },
    });
  }

  createTable() {
    let table = [];

    for (let i = 0, len = this.state.results.length; i < len; i++) {
      table.push(
        <Result
          key={i}
          download={this.download}
          result={this.state.results[i]}
        />
      );
    }
    return table;
  }

  downloadVideo() {
    var url = `/api/download/${this.state.modal.videoId}`;
    this.setState({
      modal: {
        show: false,
      },
    });

    document.location.href = url;
  }

  render() {
    return (
      <Page>
        <Panel className="animated fadeInUp">
          <ArtistInfo history={this.props.history} />
          {this.createTable()}
        </Panel>

        <Modal
          type="info"
          className={styles.customModal}
          title={this.state.modal.title + ' Download'}
          buttonText="Download"
          isOpen={this.state.modal.show}
          onClose={this.downloadVideo}
        >
          <Row>
            <Col>
              <img
                src={this.state.modal.image}
                style={{width: '100%', height: 'auto'}}
              />
            </Col>
            <Col>
              <small>{this.state.modal.album}</small>
            </Col>
          </Row>
        </Modal>
      </Page>
    );
  }
}
