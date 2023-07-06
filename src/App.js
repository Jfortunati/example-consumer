import React from 'react';
import {Link} from 'react-router-dom';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-icons.min.css';
import 'spectre.css/dist/spectre-exp.min.css';
import Heading from "./Heading";
import Layout from "./Layout";
import {withRouter} from "react-router-dom";
import API from "./api";
import PropTypes from 'prop-types';

const paymentPropTypes = {
  payment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired
};

function PaymentTableRow(props) {
  return (
    <tr>
      <td>{props.payment.name}</td>
      <td>{props.payment.type}</td>
      <td>
        <Link className="btn btn-link" to={{
          pathname: "/payments/" + props.payment.id,
          state: {
            payment: props.payment
          }
        }}>See more!</Link>
      </td>
    </tr>
  );
}
PaymentTableRow.propTypes = paymentPropTypes;

function PaymentTable(props) {
  const payments = props.payments.map(p => (
    <PaymentTableRow key={p.id} payment={p}/>
  ));
  return (
    <table className="table table-striped table-hover">
      <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th/>
      </tr>
      </thead>
      <tbody>
      {payments}
      </tbody>
    </table>
  );
}

PaymentTable.propTypes = {
  payments: PropTypes.arrayOf(paymentPropTypes.payment)
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      searchText: '',
      payments: [],
      visiblePayments: []
    };
    this.onSearchTextChange = this.onSearchTextChange.bind(this);
  }

  componentDidMount() {
    API.getAllPayments()
      .then(r => {
        this.setState({
          loading: false,
          payments: r
        });
        this.determineVisiblePayments();
      })
      .catch(e => {
        this.props.history.push({
          pathname: "/error",
          state: {
            error: e.toString()
          }
        });
      });
  }

  determineVisiblePayments() {
    const findPayments = (search) => {
      search = search.toLowerCase();
      return this.state.payments.filter(p =>
        p.id.toLowerCase().includes(search)
        || p.name.toLowerCase().includes(search)
        || p.type.toLowerCase().includes(search)
      )
    };
    this.setState((s) => {
      return {
        visiblePayments: s.searchText ? findPayments(s.searchText) : s.payments
      }
    });
  }

  onSearchTextChange(e) {
    this.setState({
      searchText: e.target.value
    });
    this.determineVisiblePayments()
  }

  render() {
    return (
      <Layout>
        <Heading text="Payments" href="/"/>
        <div className="form-group col-2">
          <label className="form-label" htmlFor="input-payment-search">Search</label>
          <input id="input-payment-search" className="form-input" type="text"
               value={this.state.searchText} onChange={this.onSearchTextChange}/>
        </div>
        {
          this.state.loading ?
            <div className="loading loading-lg centered"/> :
            <PaymentTable payments={this.state.visiblePayments}/>
        }
      </Layout>
    );
  }
}

App.propTypes = {
  history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }
  ).isRequired
};

export default withRouter(App);
