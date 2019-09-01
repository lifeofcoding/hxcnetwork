import React from 'react';
import { Page, Panel, Input, Select, Table, TableHead, TableBody, TableRow, Button, EditableText, Pagination, Breadcrumbs } from 'react-blur-admin';
import { Row, Col } from 'react-flex-proto';
import axios from 'axios';
import eventBus from '../lib/event-bus';
import Uploader from '../components/upload';

export class Crack extends React.Component {

  render() {
    return (
      <Page title="Crack WPA">

        <Panel title='Crack WPA' className="upload-page">
          <Uploader />
        </Panel>

      </Page>
    );
  }
}
