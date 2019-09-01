import React from 'react';
import { Page, Panel, Input, Select, Table, TableHead, TableBody, TableRow, Button, EditableText, Pagination, Breadcrumbs } from 'react-blur-admin';
import { Row, Col } from 'react-flex-proto';
import axios from 'axios';
import eventBus from '../lib/event-bus';

export class Proxies extends React.Component {
  constructor(props) {
    super();

    this.state = {
    	search: '',
      proxies: [],
      loading: false,
      type: ''
    };

    this.types = [
			{
				label: 'HTTP',
				value: 'http'
			},
			{
				label: 'HTTPS',
				value: 'https'
			},
			{
				label: 'SOCKS4',
				value: 'socks4'
			},
			{
				label: 'SOCKS5',
				value: 'socks5'
			},
		];

    this.getProxies = this.getProxies.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSelectType = this.onSelectType.bind(this);
  }
  onSearch(e) {
  	var terms;

  	if (!e) {
  		terms = '';
  	} else {
  		terms = e.target.value;
  	}

		let search = new RegExp("\\b("+terms+")", 'gmi');
		this.unFiltered = this.unFiltered || this.state.proxies;

		let proxies = this.unFiltered.filter((p) => {
			return (p.city.match(search) || p.country.match(search));
		});

		if (this.state.type) {
			proxies = proxies.filter((p) => {
				return p.type.toLowerCase() == this.state.type;
			});
		}

		this.setState({
			proxies,
			search: terms
		})
  }
  getProxies() {
    this.setState({
      loading: true
    });

    axios.get('/api/proxies')
    .then((response) => {
      // handle success
      console.log(response);
      this.setState({
        proxies: response.data.proxies
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

  onSelectType(value) {
  	this.setState({ type: value }, () => {
      this.onSearch()
    })
  }

  componentWillMount() {
    this.getProxies();
  }

  render() {
    const proxies = (this.state.proxies || []);
    return (
      <Page title="Proxies">
      	<Row>
          <Col>
				<Input
				onChange={this.onSearch}
				label='Search'
				value={this.state.search} />
          </Col>
          <Col basis="30px" padding="5vh 0px 0px 0px">
		    		<Select
                placeholder='Type'
                value={this.state.type}
                options={this.types}
                onChange={this.onSelectType} />
          </Col>
        </Row>

        <Panel title='Proxies'>
          <Row>
             <Col grow={false} shrink={true}><h5>Proxy List</h5></Col>
             <Col align='right' grow={true} shrink={false}><i>${proxies.length} total proxies found.</i></Col>
          </Row>

          <Table>
            <TableHead blackMutedBackground={false}>
              <th>Type</th>
              <th>Address</th>
              <th>Port</th>
              <th>City</th>
              <th>Country</th>
            </TableHead>
            <TableBody>
              {
                proxies.map((proxy, idx) => {
                  return (
                     <TableRow key={idx}>
                      <td>{proxy.type}</td>
                      <td>{proxy.address}</td>
                      <td>{proxy.port}</td>
                      <td>{proxy.city}</td>
                      <td>{proxy.country}</td>
                    </TableRow>
                  )
                })
              }
            </TableBody>
          </Table>
        </Panel>

	<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
	<input type="hidden" name="cmd" value="_s-xclick" />
	<input type="hidden" name="hosted_button_id" value="7FNT9H5JVL2S2" />
	<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_buynowCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!" />
	<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1" />
	</form>


      </Page>
    );
  }
}

