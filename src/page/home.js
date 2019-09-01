import React from 'react';
import { Page, Panel, Table, Modal, TableHead, TableBody, TableRow, Button, EditableText, Pagination, Breadcrumbs } from 'react-blur-admin';
import { Row, Col } from 'react-flex-proto';
import axios from 'axios';
import { Loading  } from '../components/loading.js';
import { ArtistInfo  } from '../components/artist-info.js';
import eventBus from '../lib/event-bus';
import styles from './scss/home.scss';
import { unescape } from 'lodash';

const decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
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
      results: [],
      page: 1,
      modal: {
      	title: '',
      	videoId:'',
      	show: false,
      },
      loading: true
    };

		this.timer = null;
    this.getResults = this.getResults.bind(this);
    this.downloadVideo = this.downloadVideo.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.params !== prevProps.params) {
      this.getResults(this.props.params.terms)
    }
  }

  getResults(terms) {
    this.setState({
      loading: true
    });

    axios.get('/api/search/' + encodeURIComponent(terms))
    .then((response) => {
      // handle success
      console.log(response);
      this.setState({
        results: response.data
      })
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
      setTimeout(() => {
        this.setState({
          loading: false
        })

        if (this.props.params.terms) {
          eventBus.getArtistInfo(this.props.params.terms);
        }
      }, 3000);

    });
  }

    millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

  componentWillMount() {
    let { params } = this.props;
    this.getResults(params.terms || 'music video');
  }

  download(result) {
  	this.setState({
  		modal: {
  			show: true,
  			title: result.artist.name +' - '+ result.name,
  			url: result.url,
  			image: result.album.image.url,
  			duration: result.duration
  		}
  	})
  }

  downloadVideo() {
  	var url = `/api/query/${this.state.modal.title}`;
  	this.setState({
  		modal: {
  			show: false
  		}
  	})

  	document.location.href = url;
  }

  play(e, result) {
    e.preventDefault();


    let song = {
    	title: result.artist.name + ' - ' + result.name,
    	url: result.url
    }
    eventBus.playSong(song)
  }

  render() {
    if (this.state.loading) {
      return (<Loading />);
    }

    const results = (this.state.results || []);
    const millisToMinutesAndSeconds = this.millisToMinutesAndSeconds;
    return (
      <Page>
        <Panel className="animated fadeInUp">
        	<ArtistInfo history={this.props.history}/>
          <Table>
            <TableBody>
              {
                results.map((result, idx) => {
                  return (
                     <TableRow key={idx}>
                      <td><img src={result.album.image} width="220px" height="auto"/></td>
                      <td>
                      	<Row>
													<Col>
														<a href={`#${result.artist.name} - ${result.name}`} className={styles.title} onClick={(e)=>this.play(e, result)}>{result.artist.name} {result.name}</a>

														<p><small>Duration: {millisToMinutesAndSeconds(result.duration)}</small></p>
													</Col>
												</Row>
                      </td>
                      <td style={{verticalAlign: 'middle'}}><Button type='info' icon={<i className='fa fa-download' />} onClick={e => this.download(result)} title='Download' size='sm'/></td>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </Panel>
				<Modal type='info' className={styles.customModal} title={this.state.modal.title + ' Download'} buttonText='Download' isOpen={this.state.modal.show} onClose={this.downloadVideo}>
          <Row>
            <Col>
              <img src={this.state.modal.image} />
            </Col>
            <Col>
            	<small>{this.state.modal.duration}</small>
            </Col>
          </Row>
        </Modal>
      </Page>
    );
  }
}

