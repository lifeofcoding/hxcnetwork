import React from 'react';
import { Page, Panel, Table, Modal, TableHead, TableBody, TableRow, Button, EditableText, Pagination, Breadcrumbs } from 'react-blur-admin';
import { Row, Col } from 'react-flex-proto';
import axios from 'axios';
import eventBus from '../lib/event-bus';

export class Home extends React.Component {
  constructor(props) {
    super();

    this.state = {
      results: [],
      page: 1,
      modal: {
      	title: '',
      	url:'',
      	show: false,
      },
      loading: false
    };

    this.getResults = this.getResults.bind(this);
    this.downloadVideo = this.downloadVideo.bind(this);
    eventBus.on('search', (terms) => {
    	this.getResults(terms)
    });
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
        results: response.data.items
      })
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
      this.setState({
        loading: false
      })
    });
  }

  componentWillMount() {
    this.getResults('music video');
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

  render() {
    const results = (this.state.results || []);
    return (
      <Page>
        <Panel>
          <Table>
            <TableBody>
              {
                results.map((result, idx) => {
                  return (
                     <TableRow key={idx}>
                      <td><img src={result.snippet.thumbnails.default.url} width="120px" height="auto"/></td>
                      <td>
                      	<Row>
													<Col>
														<b>{result.snippet.title}</b>
													</Col>
												</Row>
												 <Row>
													<Col>
														<b>{result.snippet.description}</b>
													</Col>
												</Row>
                      </td>
                      <td><Button type='success' icon={<i className='fa fa-download' />} onClick={e => this.download(result)} title='Download' size='sm'/></td>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </Panel>
				<Modal type='info' title={this.state.modal.title + ' Download'} buttonText='Download' isOpen={this.state.modal.show} onClose={this.downloadVideo}>
          <Row>
            <Col>
              <img src={this.state.modal.image} />
            </Col>
          </Row>
        </Modal>
      </Page>
    );
  }
}

