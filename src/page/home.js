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
import {unescape} from 'lodash';

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
    let {params} = this.props;
    this.getResults(params.terms || 'indie');
  }

  createTable() {
    let table = [];

    for (let i = 0, len = this.state.results.length; i < len; i++) {
      table.push(<Result key={i} result={this.state.results[i]} />);
    }
    return table;
  }

  render() {
    return (
      <Page>
        <Panel className="animated fadeInUp">
          <ArtistInfo history={this.props.history} />
          {this.createTable()}
        </Panel>
      </Page>
    );
  }
}
